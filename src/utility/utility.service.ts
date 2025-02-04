import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilityService {
    convertFiltersToQuery(filters: any[], withoutWhere?: boolean): string {
        const duplicateFilters = filters.map((item) => {
            return `${item.key} ${item.type} ${item.type == 'BETWEEN' ? "'" + item.searchText1 + "'" + ' and ' + "'" + item.searchText2 + "'" : item.searchText1}`
        });

        return withoutWhere ? `${duplicateFilters.join(" and ")}` : `WHERE ${duplicateFilters.join(" and ")}`;
    }
}
