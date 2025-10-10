import { QueryBuilder } from 'typeorm';

export class SqlUtil {
  public static buildRawSqlFromQueryBuilder<T>(queryBuilder: QueryBuilder<T>): string {
    const [query, params] = queryBuilder.getQueryAndParameters();
    let rawSql = query;
    params.forEach((value: any) => {
      if (typeof value === 'string') {
        rawSql = rawSql.replace('?', `"${value}"`);
      }
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          rawSql = rawSql.replace(
            '?',
            value.map((element) => (typeof element === 'string' ? `"${element}"` : element)).join(',')
          );
        } else {
          rawSql = rawSql.replace('?', value);
        }
      }
      if (['number', 'boolean'].includes(typeof value)) {
        rawSql = rawSql.replace('?', value.toString());
      }
    });
    return rawSql;
  }
}
