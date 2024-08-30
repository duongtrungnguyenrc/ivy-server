// import { mapMongooseExceptionToHttpException } from "@app/utils";
// import { Catch, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
// import { Response } from "express";

// import { MongooseError } from "mongoose";

// @Catch(MongooseError)
// export class GrpcExceptionFilter implements ExceptionFilter {
//   catch(exception: MongooseError, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();

//     const status = mapMongooseExceptionToHttpException(exception);

//     response.status(status).json({
//       statusCode: status,
//       message: exception.message,
//     });
//   }
// }
