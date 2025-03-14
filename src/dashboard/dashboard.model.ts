export namespace DashboardModel {
    export class IDashboardCount {
        pelanggan: number;
        mitra: number;
        invoice: number;
        payment: number;
    }

    export class GetDashboardCount {
        status: boolean;
        message: string;
        data: IDashboardCount
    }

    export class IDashboardPaymentWeekly {
        date: string;
        total: number;
    }

    export class GetDashboardPaymentWeekly {
        status: boolean;
        message: string;
        data: IDashboardPaymentWeekly[]
    }

    export class IDashboardPaymentMonthly {
        month: string;
        total: number;
    }

    export class GetDashboardPaymentMonthly {
        status: boolean;
        message: string;
        data: IDashboardPaymentMonthly[]
    }
}