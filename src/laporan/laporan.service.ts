import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LaporanModel } from './laporan.model';
import { PrismaService } from 'src/prisma.service';
import { subDays, format, eachDayOfInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Request } from 'express';
import { UtilityService } from 'src/utility/utility.service';

@Injectable()
export class LaporanService {

    constructor(
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
    ) { }

    async getRekapTagihanBulanan(query: LaporanModel.IQueryParamLaporanTagihan): Promise<LaporanModel.GetRekapTagihanBulanan> {
        try {
            if (!query.date) {
                return {
                    status: false,
                    message: 'Bulan dan Tahun tidak boleh kosong',
                    data: null
                }
            };

            // Calculate the first and last day of the given month
            const start_date = format(startOfMonth(new Date(query.date)), 'yyyy-MM-dd');
            const end_date = format(endOfMonth(new Date(query.date)), 'yyyy-MM-dd');

            // Generate array of dates for the whole month
            const dates = eachDayOfInterval({
                start: new Date(start_date),
                end: new Date(end_date)
            }).map(day => ({
                date: format(day, 'yyyy-MM-dd'),
                total: 0
            }));

            let res: any[] =
                dates,
                queries: any = {
                    invoice_date: {
                        gte: `${start_date}T00:00:00.000Z`,
                        lte: `${end_date}T23:59:59.999Z`,
                    }
                };

            if (query.id_setting_company) {
                queries.pelanggan = {
                    id_setting_company: parseInt(query.id_setting_company as any)
                };
            };

            if (query.id_product) {
                queries.id_product = parseInt(query.id_product as any);
            };

            const invoice = await this._prismaService
                .invoice
                .findMany({
                    where: queries,
                    include: {
                        pelanggan: {
                            include: {
                                setting_company: true
                            }
                        },
                        product: true,
                    },
                    orderBy: {
                        create_at: 'asc'
                    }
                });

            invoice.forEach(invoice => {
                const paymentDate = format(new Date(invoice.create_at), 'yyyy-MM-dd'); // Extract date

                // Find the corresponding date in `res` and add the total
                const dateEntry = res.find(entry => entry.date === paymentDate);
                if (dateEntry) {
                    dateEntry.total += invoice.total;
                }
            });

            return {
                status: true,
                message: '',
                data: res
            };

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getDetailTagihanBulanan(query: LaporanModel.IQueryParamLaporanTagihan): Promise<LaporanModel.GetDetailTagihanBulanan> {
        try {
            if (!query.date) {
                return {
                    status: false,
                    message: 'Bulan dan Tahun tidak boleh kosong',
                    data: null
                }
            };

            // Calculate the first and last day of the given month
            const start_date = format(startOfMonth(new Date(query.date)), 'yyyy-MM-dd');
            const end_date = format(endOfMonth(new Date(query.date)), 'yyyy-MM-dd');

            let queries: any = {
                invoice_date: {
                    gte: `${start_date}T00:00:00.000Z`,
                    lte: `${end_date}T23:59:59.999Z`,
                }
            };

            if (query.id_setting_company) {
                queries.pelanggan = {
                    id_setting_company: parseInt(query.id_setting_company as any)
                };
            };

            if (query.id_product) {
                queries.id_product = parseInt(query.id_product as any);
            };

            if (query.invoice_status) {
                queries.invoice_status = query.invoice_status;
            };

            const invoice = await this._prismaService
                .invoice
                .findMany({
                    where: queries,
                    include: {
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                pelanggan_code: true,
                                whatsapp: true,
                                setting_company: {
                                    select: {
                                        id_setting_company: true,
                                        company_name: true
                                    }
                                }
                            }
                        },
                        product: {
                            select: {
                                id_product: true,
                                product_name: true,
                            },
                        }
                    },
                    orderBy: {
                        invoice_date: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: invoice.map((item) => {
                    return {
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice_number,
                        invoice_date: item.invoice_date,
                        id_pelanggan: item.id_pelanggan,
                        id_setting_company: item.pelanggan.setting_company.id_setting_company,
                        company_name: item.pelanggan.setting_company.company_name,
                        full_name: item.pelanggan.full_name,
                        pelanggan_code: item.pelanggan.pelanggan_code,
                        whatsapp: item.pelanggan.whatsapp,
                        id_pelanggan_product: item.id_pelanggan_product,
                        id_product: item.id_product,
                        product_name: item.product.product_name,
                        price: item.price,
                        diskon_percentage: item.diskon_percentage,
                        diskon_rupiah: item.diskon_rupiah,
                        pajak: item.pajak,
                        admin_fee: item.admin_fee,
                        unique_code: item.unique_code,
                        total: item.total,
                        due_date: item.due_date,
                        notes: item.notes,
                        invoice_status: item.invoice_status,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
                        is_deleted: item.is_deleted,
                        delete_at: item.delete_at,
                        delete_by: item.delete_by,
                    }
                })
            };

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getRekapPembayaranBulanan(query: LaporanModel.IQueryParamLaporanPembayaran): Promise<LaporanModel.GetRekapPembayaranBulanan> {
        try {
            if (!query.date) {
                return {
                    status: false,
                    message: 'Bulan dan Tahun tidak boleh kosong',
                    data: null
                }
            }

            // Calculate the first and last day of the given month
            const start_date = format(startOfMonth(new Date(query.date)), 'yyyy-MM-dd');
            const end_date = format(endOfMonth(new Date(query.date)), 'yyyy-MM-dd');

            // Generate array of dates for the whole month
            const dates = eachDayOfInterval({
                start: new Date(start_date),
                end: new Date(end_date)
            }).map(day => ({
                date: format(day, 'yyyy-MM-dd'),
                total: 0
            }));

            let res: any[] = dates,
                queries: any = {
                    create_at: {
                        gte: `${start_date}T00:00:00.000Z`,
                        lte: `${end_date}T23:59:59.999Z`,
                    }
                };

            if (query.id_setting_company) {
                queries.pelanggan = {
                    ...queries.pelanggan,
                    id_setting_company: parseInt(query.id_setting_company as any)
                };
            };

            if (query.id_group_pelanggan) {
                queries.pelanggan = {
                    ...queries.pelanggan,
                    id_group_pelanggan: parseInt(query.id_group_pelanggan as any)
                }
            };

            const payment = await this._prismaService
                .payment
                .findMany({
                    where: queries,
                    include: {
                        pelanggan: true,
                    }
                });

            payment.forEach(invoice => {
                const paymentDate = format(new Date(invoice.create_at), 'yyyy-MM-dd'); // Extract date

                // Find the corresponding date in `res` and add the total
                const dateEntry = res.find(entry => entry.date === paymentDate);
                if (dateEntry) {
                    dateEntry.total += invoice.payment_amount;
                }
            });

            return {
                status: true,
                message: '',
                data: res
            };

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getDetailPembayaranBulanan(query: LaporanModel.IQueryParamLaporanPembayaran): Promise<LaporanModel.GetDetailPembayaranBulanan> {
        try {
            if (!query.date) {
                return {
                    status: false,
                    message: 'Bulan dan Tahun tidak boleh kosong',
                    data: null
                }
            };

            // Calculate the first and last day of the given month
            const start_date = format(startOfMonth(new Date(query.date)), 'yyyy-MM-dd');
            const end_date = format(endOfMonth(new Date(query.date)), 'yyyy-MM-dd');

            let queries: any = {
                create_at: {
                    gte: `${start_date}T00:00:00.000Z`,
                    lte: `${end_date}T23:59:59.999Z`,
                }
            };

            if (query.id_setting_company) {
                queries.pelanggan = {
                    ...queries.pelanggan,
                    id_setting_company: parseInt(query.id_setting_company as any)
                };
            };

            if (query.id_group_pelanggan) {
                queries.pelanggan = {
                    ...queries.pelanggan,
                    id_group_pelanggan: parseInt(query.id_group_pelanggan as any)
                }
            };

            if (query.payment_status) {
                queries.payment_status = query.payment_status
            };

            let res = await this._prismaService
                .payment
                .findMany({
                    where: queries,
                    include: {
                        invoice: {
                            select: {
                                invoice_number: true,
                                invoice_date: true,
                                total: true,
                            }
                        },
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                pelanggan_code: true,
                                setting_company: {
                                    select: {
                                        id_setting_company: true,
                                        company_name: true
                                    }
                                }
                            }
                        },
                        product: {
                            select: {
                                id_product: true,
                                product_name: true,
                            },
                        }
                    },
                    orderBy: {
                        id_invoice: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_payment: item.id_payment,
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice.invoice_number,
                        invoice_date: item.invoice.invoice_date,
                        total: item.invoice.total,
                        id_pelanggan: item.id_pelanggan,
                        id_setting_company: item.pelanggan.setting_company.id_setting_company,
                        company_name: item.pelanggan.setting_company.company_name,
                        full_name: item.pelanggan.full_name,
                        pelanggan_code: item.pelanggan.pelanggan_code,
                        id_product: item.id_product,
                        product_name: item.product.product_name,
                        payment_token: "-",
                        payment_id: item.payment_id,
                        payment_number: item.payment_number,
                        payment_date: item.payment_date,
                        payment_method: item.payment_method,
                        payment_status: item.payment_status,
                        payment_amount: item.payment_amount,
                        payment_provider: item.payment_provider,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
                    }
                })
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getTagihanKsoMitra(req: Request, periode: string) {
        try {
            if (!periode) {
                return {
                    status: false,
                    message: 'Bulan dan Tahun tidak boleh kosong',
                    data: null
                }
            };

            // Calculate the first and last day of the given month
            const start_date = format(startOfMonth(new Date(periode)), 'yyyy-MM-dd');
            const end_date = format(endOfMonth(new Date(periode)), 'yyyy-MM-dd');

            const mitra = await this._prismaService
                .setting_company
                .findMany({
                    where: {
                        is_cabang: false,
                        is_mitra: true,
                        is_active: true
                    }
                });

            for (let item of mitra) {
                let payload = {
                    id_setting_company: item.id_setting_company,
                    periode: new Date(periode),
                    jumlah_pelanggan: 0,
                    jumlah_pemasukan: 0,
                    total_bhp_uso: 0,
                    total_pph_final: 0,
                    total_kso: 0,
                    total_tagihan: 0,
                    status_bayar: "PENDING",
                }

                payload.jumlah_pelanggan = await this._prismaService
                    .pelanggan
                    .count({
                        where: {
                            id_setting_company: item.id_setting_company
                        }
                    });

                const invoice = await this._prismaService
                    .payment
                    .findMany({
                        where: {
                            pelanggan: {
                                id_setting_company: item.id_setting_company
                            },
                            payment_date: {
                                gte: `${start_date}T00:00:00.000Z`,
                                lte: `${end_date}T23:59:59.999Z`,
                            },
                            payment_status: 'PAID'
                        }
                    });

                invoice.forEach(invoice => {
                    payload.jumlah_pemasukan += parseFloat(invoice.payment_amount as any);
                });

                payload.total_bhp_uso = payload.jumlah_pemasukan * (1.75 / 100);
                payload.total_pph_final = payload.jumlah_pemasukan * (0.5 / 100);
                payload.total_kso = payload.jumlah_pemasukan * (5 / 100);
                payload.total_tagihan = payload.jumlah_pemasukan + payload.total_bhp_uso + payload.total_pph_final + payload.total_kso;
                payload.status_bayar = "PENDING";

                const getTagihanKso = await this._prismaService
                    .tagihan_kso
                    .findFirst({
                        where: {
                            id_setting_company: item.id_setting_company,
                            periode: {
                                gte: `${start_date}T00:00:00.000Z`,
                                lte: `${end_date}T23:59:59.999Z`,
                            },
                        }
                    });

                if (!getTagihanKso) {
                    let createTagihanKso = await this._prismaService
                        .tagihan_kso
                        .create({
                            data: {
                                ...payload,
                                no_tagihan_kso: this._utilityService.onFormatDate(new Date(), 'DD/MM/yyyy HH:mm'),
                                create_at: new Date(),
                                create_by: req['user']['id_user']
                            }
                        });

                    if (!createTagihanKso) {
                        return {
                            status: false,
                            message: '',
                            data: 'Gagal Simpan Tagihan KSO Mitra'
                        };
                    }
                } else {
                    if (getTagihanKso.status_bayar == 'PENDING') {
                        let updateTagihanKso = await this._prismaService
                            .tagihan_kso
                            .update({
                                where: {
                                    id_tagihan_kso: parseInt(getTagihanKso.id_tagihan_kso as any),
                                },
                                data: {
                                    ...payload,
                                    no_tagihan_kso: this._utilityService.onFormatDate(new Date(), 'DD/MM/yyyy HH:mm'),
                                    create_at: new Date(),
                                    create_by: req['user']['id_user']
                                }
                            });

                        if (!updateTagihanKso) {
                            return {
                                status: false,
                                message: '',
                                data: 'Gagal Update Tagihan KSO Mitra'
                            };
                        }
                    }
                }
            }

            const tagihan_kso = await this._prismaService
                .tagihan_kso
                .findMany({
                    where: {
                        periode: {
                            gte: `${start_date}T00:00:00.000Z`,
                            lte: `${end_date}T23:59:59.999Z`,
                        },
                    },
                    include: {
                        setting_company: true,
                    },
                    orderBy: {
                        id_setting_company: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: tagihan_kso.map((item) => {
                    return {
                        "id_tagihan_kso": item.id_tagihan_kso,
                        "no_tagihan_kso": item.no_tagihan_kso,
                        "periode": this._utilityService.onFormatDate(new Date(item.periode), 'MMMM yyyy'),
                        "id_setting_company": item.id_setting_company,
                        "company_name": item.setting_company.company_name,
                        "company_address": item.setting_company.company_address,
                        "jumlah_pelanggan": item.jumlah_pelanggan,
                        "jumlah_pemasukan": item.jumlah_pemasukan,
                        "total_bhp_uso": item.total_bhp_uso,
                        "total_pph_final": item.total_pph_final,
                        "total_kso": item.total_kso,
                        "total_tagihan": item.total_tagihan,
                        "status_bayar": item.status_bayar,
                        "create_at": item.create_at,
                        "create_by": item.create_by,
                        "update_at": item.update_at,
                        "update_by": item.update_by,
                    }
                })
            };

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async updateTagihanKsoMitra(req: Request, id_tagihan_kso: string): Promise<any> {
        try {
            const tagihanKso = await this._prismaService
                .tagihan_kso
                .findFirst({
                    where: { id_tagihan_kso: parseInt(id_tagihan_kso as any) },
                    select: {
                        status_bayar: true
                    }
                });

            let res = await this._prismaService
                .tagihan_kso
                .update({
                    where: { id_tagihan_kso: parseInt(id_tagihan_kso as any) },
                    data: {
                        status_bayar: tagihanKso.status_bayar == 'PENDING' ? 'PAID' : 'PENDING',
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
                    }
                });

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            console.log("error =>", error);
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }
}
