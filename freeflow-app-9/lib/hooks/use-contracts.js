"use strict";
// Hook for Contracts management
// Created: December 14, 2024
Object.defineProperty(exports, "__esModule", { value: true });
exports.useContracts = useContracts;
var use_supabase_query_1 = require("./use-supabase-query");
var use_supabase_mutation_1 = require("./use-supabase-mutation");
function useContracts(options) {
    if (options === void 0) { options = {}; }
    var status = options.status, contractType = options.contractType, limit = options.limit;
    var filters = {};
    if (status && status !== 'all')
        filters.status = status;
    if (contractType && contractType !== 'all')
        filters.contract_type = contractType;
    var queryOptions = {
        table: 'contracts',
        filters: filters,
        orderBy: { column: 'created_at', ascending: false },
        realtime: true
    };
    if (limit !== undefined)
        queryOptions.limit = limit;
    var _a = (0, use_supabase_query_1.useSupabaseQuery)(queryOptions), data = _a.data, loading = _a.loading, error = _a.error, refetch = _a.refetch;
    var _b = (0, use_supabase_mutation_1.useSupabaseMutation)({
        table: 'contracts',
        onSuccess: refetch
    }), create = _b.create, update = _b.update, remove = _b.remove, mutating = _b.loading;
    return {
        contracts: data,
        loading: loading,
        error: error,
        mutating: mutating,
        createContract: create,
        updateContract: update,
        deleteContract: remove,
        refetch: refetch
    };
}
