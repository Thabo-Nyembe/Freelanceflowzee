// Base hook for Supabase mutations (Create, Update, Delete)
// Created: December 14, 2024
'use client';
"use strict";
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
exports.useSupabaseMutation = useSupabaseMutation;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var sonner_1 = require("sonner");
function useSupabaseMutation(_a) {
    var _this = this;
    var table = _a.table, onSuccess = _a.onSuccess, onError = _a.onError, _b = _a.enableRealtime, enableRealtime = _b === void 0 ? false : _b, onRealtimeUpdate = _a.onRealtimeUpdate;
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), lastMutation = _d[0], setLastMutation = _d[1];
    var supabase = (0, client_1.createClient)();
    var _e = (0, react_1.useState)(null), session = _e[0], setSession = _e[1];
    (0, react_1.useEffect)(function () {
        fetch('/api/auth/session')
            .then(function (res) { return res.json(); })
            .then(function (data) { return setSession(data); })
            .catch(function () { });
    }, []);
    // Get user ID from NextAuth session or Supabase auth
    // IMPORTANT: financial_transactions has FK to auth.users, not public.users
    // So we need to get the auth.users ID from the session's authId field
    var getUserId = function () { return __awaiter(_this, void 0, void 0, function () {
        var user, authId, uuidRegex;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, supabase.auth.getUser()];
                case 1:
                    user = (_c.sent()).data.user;
                    if (user === null || user === void 0 ? void 0 : user.id) {
                        return [2 /*return*/, user.id];
                    }
                    authId = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.authId;
                    if (authId) {
                        return [2 /*return*/, authId];
                    }
                    // Fallback: try NextAuth session user.id if it's a valid UUID
                    // Note: This may fail FK constraints if the ID is from public.users
                    if ((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id) {
                        uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                        if (uuidRegex.test(session.user.id)) {
                            console.log('Warning: Using public.users ID, may fail FK constraints');
                            return [2 /*return*/, session.user.id];
                        }
                    }
                    return [2 /*return*/, null];
            }
        });
    }); };
    // Realtime subscription for mutation confirmations
    (0, react_1.useEffect)(function () {
        if (!enableRealtime)
            return;
        var channel = supabase
            .channel("mutation-".concat(table, "-changes"))
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, function (payload) {
            var _a, _b;
            // Track realtime updates
            setLastMutation({
                type: payload.eventType,
                id: ((_a = payload.new) === null || _a === void 0 ? void 0 : _a.id) || ((_b = payload.old) === null || _b === void 0 ? void 0 : _b.id),
                timestamp: Date.now()
            });
            // Call the callback if provided
            if (onRealtimeUpdate) {
                onRealtimeUpdate(payload);
            }
        })
            .subscribe();
        return function () {
            supabase.removeChannel(channel);
        };
    }, [supabase, table, enableRealtime, onRealtimeUpdate]);
    var create = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var dataWithUser, userId, _a, result, error, err_1, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, 5, 6]);
                    setLoading(true);
                    dataWithUser = __assign({}, data);
                    if (!!dataWithUser.user_id) return [3 /*break*/, 2];
                    return [4 /*yield*/, getUserId()];
                case 1:
                    userId = _b.sent();
                    if (!userId) {
                        throw new Error('User not authenticated');
                    }
                    dataWithUser.user_id = userId;
                    _b.label = 2;
                case 2: return [4 /*yield*/, supabase
                        .from(table)
                        .insert(dataWithUser)
                        .select()
                        .single()];
                case 3:
                    _a = _b.sent(), result = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    sonner_1.toast.success('Created successfully');
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    return [2 /*return*/, result];
                case 4:
                    err_1 = _b.sent();
                    error = err_1 instanceof Error ? err_1 : new Error('Failed to create');
                    sonner_1.toast.error(error.message);
                    onError === null || onError === void 0 ? void 0 : onError(error);
                    throw error;
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var update = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
        var _a, result, error, err_2, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, supabase
                            .from(table)
                            .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                            .eq('id', id)
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), result = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    sonner_1.toast.success('Updated successfully');
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    return [2 /*return*/, result];
                case 2:
                    err_2 = _b.sent();
                    error = err_2 instanceof Error ? err_2 : new Error('Failed to update');
                    sonner_1.toast.error(error.message);
                    onError === null || onError === void 0 ? void 0 : onError(error);
                    throw error;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var remove = function (id_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([id_1], args_1, true), void 0, function (id, hardDelete) {
            var error, error, err_3, error;
            if (hardDelete === void 0) { hardDelete = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, 6, 7]);
                        setLoading(true);
                        if (!hardDelete) return [3 /*break*/, 2];
                        return [4 /*yield*/, supabase
                                .from(table)
                                .delete()
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, supabase
                            .from(table)
                            .update({ deleted_at: new Date().toISOString() })
                            .eq('id', id)];
                    case 3:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        _a.label = 4;
                    case 4:
                        sonner_1.toast.success('Deleted successfully');
                        onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                        return [3 /*break*/, 7];
                    case 5:
                        err_3 = _a.sent();
                        error = err_3 instanceof Error ? err_3 : new Error('Failed to delete');
                        sonner_1.toast.error(error.message);
                        onError === null || onError === void 0 ? void 0 : onError(error);
                        throw error;
                    case 6:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return { create: create, update: update, remove: remove, loading: loading, lastMutation: lastMutation };
}
