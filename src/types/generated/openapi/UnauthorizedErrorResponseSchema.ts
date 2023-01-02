/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UnauthorizedErrorResponseSchema = {
    status: number;
    statusCode: string;
    error: {
        message: string,
        code: UnauthorizedErrorResponseSchema.code,
        details?: any,
    };
}

export namespace UnauthorizedErrorResponseSchema {

    export enum code {
        UNAUTHORIZED = 'UNAUTHORIZED',
    }


}
