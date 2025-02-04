export namespace AuthenticationModel {
    export class ILoginPayload {
        username: string;
        password: string;
    }

    export class ILoginResponse {
        id_user: number;
        id_user_group: number;
        user_group: string;
        username: string;
        full_name: string;
        email: string;
        phone: string;
        whatsapp: string;
        notes: string;
        token: string;
    }

    export class Login {
        status: boolean;
        message: string;
        data: ILoginResponse;
    }

    export class IRegisterPayload {
        id_user_group: number;
        full_name: string;
        username: string;
        password: string;
        email: string;
        address?: string;
        phone?: string;
        whatsapp?: string;
        notes?: string;
    }

    export class IProfile {
        id_user: number;
        id_user_group: number;
        user_group: string;
        username: string;
        full_name: string;
        email: string;
        password: string;
        phone: string;
        whatsapp: string;
        notes: string;
    }

    export class GetProfile {
        status: boolean;
        message: string;
        data: IProfile;
    }

    export class UpdateProfile {
        full_name: string;
        username: string;
        password: string;
        email: string;
        address?: string;
        phone?: string;
        whatsapp?: string;
        notes?: string;
    }
}