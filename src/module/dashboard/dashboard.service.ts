import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { DashboardModel } from './dashboard.model';
import { subDays, format, eachDayOfInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';

@Injectable({ scope: Scope.TRANSIENT })
export class DashboardService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getDashboardCount(req: Request): Promise<DashboardModel.GetDashboardCount> {
        try {
            let res: DashboardModel.IDashboardCount = {
                pelanggan: 0,
                invoice: 0,
                mitra: 0,
                payment: 0
            };

            res.pelanggan = await this._prismaService
                .pelanggan
                .count({
                    where: {
                        is_active: true,
                        id_setting_company: parseInt(req['user']['id_setting_company'])
                    }
                });

            res.invoice = await this._prismaService
                .invoice
                .count({
                    where: {
                        invoice_status: 'PENDING',
                        pelanggan: {
                            id_setting_company: parseInt(req['user']['id_setting_company'])
                        }
                    }
                });

            res.mitra = await this._prismaService
                .setting_company
                .count({
                    where: {
                        is_mitra: true,
                        is_cabang: false,
                        is_active: true
                    }
                });

            res.payment = await this._prismaService
                .payment
                .count({
                    where: {
                        payment_status: 'PAID',
                        pelanggan: {
                            id_setting_company: parseInt(req['user']['id_setting_company'])
                        }
                    }
                });

            return {
                status: true,
                message: '',
                data: res
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

    async getDashboardPaymentWeekly(req: Request, start_date: string, end_date: string): Promise<DashboardModel.GetDashboardPaymentWeekly> {
        try {
            // Generate array of dates from start_date to end_date
            const dates = eachDayOfInterval({
                start: new Date(start_date),
                end: new Date(end_date)
            }).map(date => ({
                date: format(date, 'yyyy-MM-dd'), // Format date as YYYY-MM-DD
                total: 0
            }));

            let res: DashboardModel.IDashboardPaymentWeekly[] = dates;

            // Fetch payments from the database
            const payments = await this._prismaService.payment.findMany({
                where: {
                    payment_status: 'PAID',
                    pelanggan: {
                        id_setting_company: parseInt(req['user']['id_setting_company'])
                    },
                    create_at: {
                        gte: `${start_date}T00:00:00.000Z`,
                        lte: `${end_date}T23:59:59.999Z`,
                    }
                },
            });

            // Sum the payment amounts by date
            payments.forEach(payment => {
                const paymentDate = format(new Date(payment.create_at), 'yyyy-MM-dd'); // Extract date

                // Find the corresponding date in `res` and add the total
                const dateEntry = res.find(entry => entry.date === paymentDate);
                if (dateEntry) {
                    dateEntry.total += payment.payment_amount;
                }
            });

            return {
                status: true,
                message: '',
                data: res
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

    async getDashboardPaymentMonthly(req: Request, date: string): Promise<DashboardModel.GetDashboardPaymentWeekly> {
        try {
            // Calculate the first and last day of the given month
            const start_date = format(startOfMonth(new Date(date)), 'yyyy-MM-dd');
            const end_date = format(endOfMonth(new Date(date)), 'yyyy-MM-dd');

            // Generate array of dates for the whole month
            const dates = eachDayOfInterval({
                start: new Date(start_date),
                end: new Date(end_date)
            }).map(day => ({
                date: format(day, 'yyyy-MM-dd'),
                total: 0
            }));

            let res: DashboardModel.IDashboardPaymentWeekly[] = dates;

            // Fetch payments from the database within the month
            const payments = await this._prismaService.payment.findMany({
                where: {
                    payment_status: 'PAID',
                    pelanggan: {
                        id_setting_company: parseInt(req['user']['id_setting_company'])
                    },
                    create_at: {
                        gte: `${start_date}T00:00:00.000Z`,
                        lte: `${end_date}T23:59:59.999Z`,
                    }
                },
            });

            // Sum the payment amounts by date
            payments.forEach(payment => {
                const paymentDate = format(new Date(payment.create_at), 'yyyy-MM-dd'); // Extract date

                // Find the corresponding date in `res` and add the total
                const dateEntry = res.find(entry => entry.date === paymentDate);
                if (dateEntry) {
                    dateEntry.total += payment.payment_amount;
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

    async getDashboardPaymentYearly(req: Request, year: string): Promise<DashboardModel.GetDashboardPaymentMonthly> {
        try {
            const start_date = format(new Date(`${year}-01-01`), 'yyyy-MM-dd');
            const end_date = format(new Date(`${year}-12-31`), 'yyyy-MM-dd');

            // Buat array untuk tiap bulan (Jan - Dec)
            const months = Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                return {
                    month: format(new Date(`${year}-${month.toString().padStart(2, '0')}-01`), 'yyyy-MM'),
                    total: 0
                };
            });

            let res: DashboardModel.IDashboardPaymentMonthly[] = months;

            // Ambil data payment yang statusnya 'PAID' selama 1 tahun
            const payments = await this._prismaService.payment.findMany({
                where: {
                    payment_status: 'PAID',
                    pelanggan: {
                        id_setting_company: parseInt(req['user']['id_setting_company'])
                    },
                    create_at: {
                        gte: `${start_date}T00:00:00.000Z`,
                        lte: `${end_date}T23:59:59.999Z`,
                    },
                },
                select: {
                    create_at: true,
                    payment_amount: true
                }
            });

            // Group dan total berdasarkan bulan (yyyy-MM)
            payments.forEach(payment => {
                const paymentMonth = format(new Date(payment.create_at), 'yyyy-MM');
                const monthEntry = res.find(entry => entry.month === paymentMonth);
                if (monthEntry) {
                    monthEntry.total += payment.payment_amount;
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

    async getLatestPayment(req: Request): Promise<any> {
        try {
            // Fetch payments from the database within the month
            const payments = await this._prismaService.payment.findMany({
                where: {
                    payment_status: 'PAID',
                    pelanggan: {
                        id_setting_company: parseInt(req['user']['id_setting_company'])
                    },
                },
                orderBy: {
                    create_at: 'asc'
                },
                take: 10,
                include: {
                    invoice: {
                        select: {
                            invoice_number: true,
                            total: true,
                        }
                    },
                    pelanggan: {
                        select: {
                            id_pelanggan: true,
                            full_name: true,
                            pelanggan_code: true,
                            alamat: true,
                        }
                    },
                    product: {
                        select: {
                            id_product: true,
                            product_name: true,
                        },
                    }
                },
            });

            return {
                status: true,
                message: '',
                data: payments.map((item) => {
                    return {
                        id_payment: item.id_payment,
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice.invoice_number,
                        total: item.invoice.total,
                        id_pelanggan: item.id_pelanggan,
                        full_name: item.pelanggan.full_name,
                        alamat: item.pelanggan.alamat,
                        pelanggan_code: item.pelanggan.pelanggan_code,
                        id_product: item.id_product,
                        product_name: item.product.product_name,
                        create_at: item.create_at,
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
}
