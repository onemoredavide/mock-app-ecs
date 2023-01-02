/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ForbiddenErrorResponseSchema = {
    status: number;
    statusCode: string;
    error: {
        message: string,
        code: ForbiddenErrorResponseSchema.code,
        details?: any,
    };
}

export namespace ForbiddenErrorResponseSchema {

    export enum code {
        FORBIDDEN = 'FORBIDDEN',
    }


}
