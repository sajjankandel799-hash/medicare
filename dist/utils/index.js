"use strict";
/**
 * Utility functions for the Hospital Management System
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.StorageError = exports.ReferentialIntegrityError = exports.EntityNotFoundError = exports.ValidationError = exports.AppError = exports.InputValidator = exports.ErrorHandler = exports.LogLevel = exports.Logger = exports.logger = exports.generateId = void 0;
var idGenerator_1 = require("./idGenerator");
Object.defineProperty(exports, "generateId", { enumerable: true, get: function () { return idGenerator_1.generateId; } });
var logger_1 = require("./logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_1.LogLevel; } });
var errorHandler_1 = require("./errorHandler");
Object.defineProperty(exports, "ErrorHandler", { enumerable: true, get: function () { return errorHandler_1.ErrorHandler; } });
Object.defineProperty(exports, "InputValidator", { enumerable: true, get: function () { return errorHandler_1.InputValidator; } });
Object.defineProperty(exports, "AppError", { enumerable: true, get: function () { return errorHandler_1.AppError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return errorHandler_1.ValidationError; } });
Object.defineProperty(exports, "EntityNotFoundError", { enumerable: true, get: function () { return errorHandler_1.EntityNotFoundError; } });
Object.defineProperty(exports, "ReferentialIntegrityError", { enumerable: true, get: function () { return errorHandler_1.ReferentialIntegrityError; } });
Object.defineProperty(exports, "StorageError", { enumerable: true, get: function () { return errorHandler_1.StorageError; } });
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return errorHandler_1.ErrorCode; } });
//# sourceMappingURL=index.js.map