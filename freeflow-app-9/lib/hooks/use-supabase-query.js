"use strict";
// Base hook for Supabase queries with real-time subscriptions
// Created: December 14, 2024
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSupabaseQuery = useSupabaseQuery;
exports.useSupabaseMutation = useSupabaseMutation;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
// Implementation that handles both overloads
function useSupabaseQuery(queryKeyOrOptions, queryFn, fnOptions) {
    // If first argument is an array, use TanStack Query-style
    if (Array.isArray(queryKeyOrOptions)) {
        return useSupabaseQueryWithFn(queryKeyOrOptions, queryFn, fnOptions);
    }
    // Otherwise use object-style
    return useSupabaseQueryWithOptions(queryKeyOrOptions);
}
// TanStack Query-style implementation
function useSupabaseQueryWithFn(queryKey, queryFn, options) {
    var _this = this;
    var _a;
    var _b = (0, react_1.useState)((_a = options === null || options === void 0 ? void 0 : options.initialData) !== null && _a !== void 0 ? _a : null), data = _b[0], setData = _b[1];
    var _c = (0, react_1.useState)((options === null || options === void 0 ? void 0 : options.enabled) !== false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var supabase = (0, client_1.createClient)();
    var fetchData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((options === null || options === void 0 ? void 0 : options.enabled) === false)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, queryFn(supabase)];
                case 2:
                    result = _a.sent();
                    setData(result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1 : new Error('Unknown error'));
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [queryFn, supabase, options === null || options === void 0 ? void 0 : options.enabled]);
    (0, react_1.useEffect)(function () {
        fetchData();
    }, [JSON.stringify(queryKey)]);
    return { data: data, isLoading: isLoading, error: error, refetch: fetchData };
}
// Object-style implementation (original behavior)
function useSupabaseQueryWithOptions(_a) {
    var _this = this;
    var table = _a.table, _b = _a.select, select = _b === void 0 ? '*' : _b, _c = _a.filters, filters = _c === void 0 ? {} : _c, orderBy = _a.orderBy, limit = _a.limit, _d = _a.realtime, realtime = _d === void 0 ? true : _d, _e = _a.softDelete // Default to false since most tables don't have deleted_at column
    , softDelete = _e === void 0 ? false : _e // Default to false since most tables don't have deleted_at column
    ;
    var _f = (0, react_1.useState)([]), data = _f[0], setData = _f[1];
    var _g = (0, react_1.useState)(true), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var supabase = (0, client_1.createClient)();
    (0, react_1.useEffect)(function () {
        function fetchData() {
            return __awaiter(this, void 0, void 0, function () {
                var query_1, _a, result, queryError, err_2;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, 3, 4]);
                            setLoading(true);
                            query_1 = supabase.from(table).select(select);
                            // Apply filters
                            Object.entries(filters).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                if (value !== undefined && value !== null && value !== 'all') {
                                    query_1 = query_1.eq(key, value);
                                }
                            });
                            // Apply ordering
                            if (orderBy) {
                                query_1 = query_1.order(orderBy.column, { ascending: (_b = orderBy.ascending) !== null && _b !== void 0 ? _b : false });
                            }
                            // Apply limit
                            if (limit) {
                                query_1 = query_1.limit(limit);
                            }
                            // Filter out soft deletes (only for tables with deleted_at column)
                            if (softDelete) {
                                query_1 = query_1.is('deleted_at', null);
                            }
                            return [4 /*yield*/, query_1];
                        case 1:
                            _a = _c.sent(), result = _a.data, queryError = _a.error;
                            if (queryError)
                                throw queryError;
                            setData(result || []);
                            setError(null);
                            return [3 /*break*/, 4];
                        case 2:
                            err_2 = _c.sent();
                            setError(err_2 instanceof Error ? err_2 : new Error('Unknown error'));
                            return [3 /*break*/, 4];
                        case 3:
                            setLoading(false);
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        fetchData();
        // Set up real-time subscription
        if (realtime) {
            var channel_1 = supabase
                .channel("".concat(table, "-changes"))
                .on('postgres_changes', { event: '*', schema: 'public', table: table }, function (payload) {
                if (payload.eventType === 'INSERT') {
                    setData(function (prev) { return __spreadArray([payload.new], prev, true); });
                }
                else if (payload.eventType === 'UPDATE') {
                    setData(function (prev) { return prev.map(function (item) {
                        return item.id === payload.new.id ? payload.new : item;
                    }); });
                }
                else if (payload.eventType === 'DELETE') {
                    setData(function (prev) { return prev.filter(function (item) { return item.id !== payload.old.id; }); });
                }
            })
                .subscribe();
            return function () {
                supabase.removeChannel(channel_1);
            };
        }
    }, [table, JSON.stringify(filters), orderBy === null || orderBy === void 0 ? void 0 : orderBy.column, orderBy === null || orderBy === void 0 ? void 0 : orderBy.ascending, limit, realtime]);
    var refetch = function () { return __awaiter(_this, void 0, void 0, function () {
        var query_2, _a, result, queryError, err_3;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    query_2 = supabase.from(table).select(select);
                    Object.entries(filters).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        if (value !== undefined && value !== null && value !== 'all') {
                            query_2 = query_2.eq(key, value);
                        }
                    });
                    if (orderBy) {
                        query_2 = query_2.order(orderBy.column, { ascending: (_b = orderBy.ascending) !== null && _b !== void 0 ? _b : false });
                    }
                    if (limit) {
                        query_2 = query_2.limit(limit);
                    }
                    // Filter out soft deletes (only for tables with deleted_at column)
                    if (softDelete) {
                        query_2 = query_2.is('deleted_at', null);
                    }
                    return [4 /*yield*/, query_2];
                case 1:
                    _a = _c.sent(), result = _a.data, queryError = _a.error;
                    if (queryError)
                        throw queryError;
                    setData(result || []);
                    setError(null);
                    return [3 /*break*/, 4];
                case 2:
                    err_3 = _c.sent();
                    setError(err_3 instanceof Error ? err_3 : new Error('Unknown error'));
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return { data: data, loading: loading, error: error, refetch: refetch };
}
// Implementation that handles both overloads
function useSupabaseMutation(mutationFnOrOptions, fnOptions) {
    // If first argument is a function, use function-style
    if (typeof mutationFnOrOptions === 'function') {
        return useSupabaseMutationWithFn(mutationFnOrOptions, fnOptions);
    }
    // Otherwise use object-style
    return useSupabaseMutationWithOptions(mutationFnOrOptions);
}
// Function-style mutation implementation
function useSupabaseMutationWithFn(mutationFn, options) {
    var _this = this;
    var _a = (0, react_1.useState)(false), isPending = _a[0], setIsPending = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var supabase = (0, client_1.createClient)();
    var mutate = (0, react_1.useCallback)(function (data) { return __awaiter(_this, void 0, void 0, function () {
        var result, err_4, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsPending(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationFn(supabase, data)];
                case 2:
                    result = _c.sent();
                    (_a = options === null || options === void 0 ? void 0 : options.onSuccess) === null || _a === void 0 ? void 0 : _a.call(options);
                    return [2 /*return*/, result];
                case 3:
                    err_4 = _c.sent();
                    error_1 = err_4 instanceof Error ? err_4 : new Error('Unknown error');
                    setError(error_1);
                    (_b = options === null || options === void 0 ? void 0 : options.onError) === null || _b === void 0 ? void 0 : _b.call(options, error_1);
                    return [2 /*return*/, null];
                case 4:
                    setIsPending(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [mutationFn, supabase, options]);
    return { mutate: mutate, isPending: isPending, error: error };
}
// Object-style mutation implementation (original behavior)
function useSupabaseMutationWithOptions(_a) {
    var _this = this;
    var table = _a.table, onSuccess = _a.onSuccess, onError = _a.onError;
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var supabase = (0, client_1.createClient)();
    var mutate = (0, react_1.useCallback)(function (data, id) { return __awaiter(_this, void 0, void 0, function () {
        var user, result, _a, updateResult, updateError, _b, insertResult, insertError, err_5, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_c.sent()).data.user;
                    if (!user)
                        throw new Error('Not authenticated');
                    result = void 0;
                    if (!id) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase
                            .from(table)
                            .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                            .eq('id', id)
                            .eq('user_id', user.id)
                            .select()
                            .single()];
                case 3:
                    _a = _c.sent(), updateResult = _a.data, updateError = _a.error;
                    if (updateError)
                        throw new Error(updateError.message);
                    result = updateResult;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, supabase
                        .from(table)
                        .insert(__assign(__assign({}, data), { user_id: user.id }))
                        .select()
                        .single()];
                case 5:
                    _b = _c.sent(), insertResult = _b.data, insertError = _b.error;
                    if (insertError)
                        throw new Error(insertError.message);
                    result = insertResult;
                    _c.label = 6;
                case 6:
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    return [2 /*return*/, result];
                case 7:
                    err_5 = _c.sent();
                    error_2 = err_5 instanceof Error ? err_5 : new Error('Unknown error');
                    setError(error_2);
                    onError === null || onError === void 0 ? void 0 : onError(error_2);
                    return [2 /*return*/, null];
                case 8:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, [supabase, table, onSuccess, onError]);
    var remove = (0, react_1.useCallback)(function (id) { return __awaiter(_this, void 0, void 0, function () {
        var user, deleteError, err_6, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_a.sent()).data.user;
                    if (!user)
                        throw new Error('Not authenticated');
                    return [4 /*yield*/, supabase
                            .from(table)
                            .update({ deleted_at: new Date().toISOString() })
                            .eq('id', id)
                            .eq('user_id', user.id)];
                case 3:
                    deleteError = (_a.sent()).error;
                    if (deleteError)
                        throw new Error(deleteError.message);
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    return [2 /*return*/, true];
                case 4:
                    err_6 = _a.sent();
                    error_3 = err_6 instanceof Error ? err_6 : new Error('Unknown error');
                    setError(error_3);
                    onError === null || onError === void 0 ? void 0 : onError(error_3);
                    return [2 /*return*/, false];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [supabase, table, onSuccess, onError]);
    return { mutate: mutate, remove: remove, loading: loading, error: error };
}
