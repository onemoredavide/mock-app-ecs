/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NotFoundErrorResponseSchema = {
    status: number;
    statusCode: string;
    error: {
        message: string,
        code: NotFoundErrorResponseSchema.code,
        details?: any,
    };
}

export namespace NotFoundErrorResponseSchema {

    export enum code {
        NOT_FOUND = 'NOT_FOUND',
    }


}
