import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModel } from './authentication.model';
import { Request } from 'express';

@Injectable()
export class AuthenticationService {

    constructor(
        private _jwtService: JwtService,
        private _prismaService: PrismaService,
    ) { }

    async login(email: string, password: string): Promise<AuthenticationModel.Login> {
        try {
            const user = await this._prismaService.user.findFirst({
                where: {
                    email: email,
                }
            });

            if (!user) {
                return {
                    status: false,
                    message: "User Tidak Ditemukan",
                    data: null,
                }
            }

            const match = password == user.password

            if (!match) {
                return {
                    status: false,
                    message: "Mohon Periksa Email / Password Anda",
                    data: null as any,
                }
            }

            let token: string = "", data: any = null;

            if (user.id_guru && !user.id_siswa) {
                const guru = await this._prismaService.guru.findUnique({
                    where: {
                        id_guru: user.id_guru
                    },
                    include: {
                        sekolah: true,
                    }
                });

                data = guru;

                token = this._jwtService.sign({
                    email: user.email,
                    id_user: user.id_user,
                    nama_lengkap: guru.nama_lengkap,
                })
            }

            if (!user.id_guru && user.id_siswa) {
                const siswa = await this._prismaService.siswa.findUnique({
                    where: {
                        id_siswa: user.id_siswa
                    },
                    include: {
                        kelas: {
                            include: {
                                sekolah: true,
                            }
                        }
                    }
                });

                data = siswa;

                token = this._jwtService.sign({
                    email: user.email,
                    id_user: user.id_user,
                    nama_lengkap: siswa.nama_lengkap,
                })
            }

            if (!user.id_guru && !user.id_siswa) {
                token = this._jwtService.sign({
                    email: user.email,
                    id_user: user.id_user,
                    nama_lengkap: "SUPERADMIN",
                })
            }

            return {
                status: true,
                message: "OK",
                data: {
                    id_user: user.id_user,
                    token: token,
                    ...data,
                    nama_lengkap: data ? data.nama_lengkap : 'SUPERADMIN'
                }
            }

        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async register(payload: AuthenticationModel.IRegister): Promise<{ result: boolean, message: string, data: any }> {
        try {
            let data = null, isUserExist = null;

            if (payload.is_guru) {
                data = await this._prismaService.guru.findFirst({
                    where: {
                        nama_lengkap: {
                            contains: payload.nama_lengkap
                        }
                    }
                });
            };

            if (!payload.is_guru) {
                data = await this._prismaService.siswa.findFirst({
                    where: {
                        nama_lengkap: {
                            contains: payload.nama_lengkap
                        }
                    }
                });
            };

            isUserExist = await this._prismaService.user.findFirst({
                where: {
                    email: payload.email
                }
            });

            if (isUserExist) {
                return {
                    result: false,
                    message: "Email Sudah Terdaftar",
                    data: null,
                }
            }

            const createUser = await this._prismaService.user.create({
                data: {
                    id_guru: payload.is_guru ? data.id_guru : null,
                    id_siswa: !payload.is_guru ? data.id_siswa : null,
                    email: payload.email,
                    password: payload.password,
                    register_at: new Date(),
                    is_active: true,
                }
            });

            if (createUser) {
                return {
                    result: true,
                    message: "User Berhasil Didaftarkan",
                    data: null,
                }
            };

        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getProfile(req: Request): Promise<any> {
        try {

            let result: any = {};

            const user = await this._prismaService
                .user
                .findUnique({
                    where: {
                        id_user: parseInt(req['user']['id_user'])
                    }
                });

            result.id_user = user.id_user;
            result.id_guru = user.id_guru;
            result.id_siswa = user.id_siswa;
            result.email = user.email;
            result.password = user.password;

            if (user.id_guru && !user.id_siswa) {
                const guru = await this._prismaService
                    .guru
                    .findUnique({
                        where: {
                            id_guru: parseInt(user.id_guru as any)
                        }
                    });

                result.nama_lengkap = guru.nama_lengkap;
                result.nip = guru.nip;
                result.is_guru = true;
            }

            if (!user.id_guru && user.id_siswa) {
                const siswa = await this._prismaService
                    .siswa
                    .findUnique({
                        where: {
                            id_siswa: parseInt(user.id_siswa as any)
                        }
                    });

                result.nama_lengkap = siswa.nama_lengkap;
                result.no_absen = siswa.no_absen;
                result.is_guru = false;
                result.id_kelas = siswa.id_kelas;
            }

            return {
                status: true,
                message: 'OK',
                data: result
            }

        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async updateProfile(req: Request, payload: AuthenticationModel.UpdateProfile): Promise<any> {
        try {
            let res = await this._prismaService
                .user
                .update({
                    where: { id_user: parseInt(req['user']['id_user'] as any) },
                    data: {
                        email: payload.email,
                        password: payload.password,
                    }
                });

            if (!res) {
                return {
                    status: false,
                    message: 'Update profile failed',
                    data: null
                }
            }

            if (res.id_guru && !res.id_siswa) {
                let resGuru = await this._prismaService
                    .guru
                    .update({
                        where: { id_guru: parseInt(res.id_guru as any) },
                        data: {
                            nama_lengkap: payload.nama_lengkap,
                            nip: payload.nip,
                        }
                    });

                if (!resGuru) {
                    return {
                        status: false,
                        message: 'Update guru failed',
                        data: null
                    }
                };
            }

            if (!res.id_guru && res.id_siswa) {
                let resSiswa = await this._prismaService
                    .siswa
                    .update({
                        where: { id_siswa: parseInt(res.id_siswa as any) },
                        data: {
                            nama_lengkap: payload.nama_lengkap,
                            no_absen: payload.no_absen,
                        }
                    });

                if (!resSiswa) {
                    return {
                        status: false,
                        message: 'Update siswa failed',
                        data: null
                    }
                };
            }

            return {
                status: true,
                message: 'OK',
                data: res
            }

        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
