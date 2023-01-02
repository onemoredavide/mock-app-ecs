/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Hello400ResponseSchema = {
    status: number;
    statusCode: string;
    error: {
        message: string,
        code: Hello400ResponseSchema.code,
        details?: any,
    };
}

export namespace Hello400ResponseSchema {

    export enum code {
        VALIDATION_ERROR = 'VALIDATION_ERROR',
    }


}
