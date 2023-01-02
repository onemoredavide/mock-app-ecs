/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Hello404ResponseSchema = {
    status: number;
    statusCode: string;
    error: {
        message: string,
        code: Hello404ResponseSchema.code,
        details?: any,
    };
}

export namespace Hello404ResponseSchema {

    export enum code {
        NOT_FOUND = 'NOT_FOUND',
    }


}
