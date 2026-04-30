import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DefaultAzureCredential } from '@azure/identity';

// Always resolve .env relative to this file (server/.env) regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Check if using Managed Identity (Azure production) or SQL Auth (local dev)
const useManagedIdentity = process.env.USE_MANAGED_IDENTITY === 'true';

// Check if database is configured
const isDatabaseConfigured = !!(
    process.env.DB_SERVER && 
    process.env.DB_DATABASE
);

let config = null;

if (isDatabaseConfigured) {
    if (useManagedIdentity) {
        // Azure Managed Identity (passwordless)
        console.log('🔐 Using Azure Managed Identity for database authentication');
        config = {
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            port: parseInt(process.env.DB_PORT) || 1433,
            authentication: {
                type: 'azure-active-directory-default'
            },
            options: {
                encrypt: true,
                trustServerCertificate: false,
                enableArithAbort: true,
                requestTimeout: 30000,
                connectionTimeout: 30000
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        };
    } else {
        // SQL Authentication (local development)
        console.log('🔑 Using SQL Authentication for database');
        const hasSqlAuth = !!(process.env.DB_USER && process.env.DB_PASSWORD);
        
        config = hasSqlAuth ? {
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT) || 1433,
            options: {
                encrypt: true,
                trustServerCertificate: false,
                enableArithAbort: true,
                requestTimeout: 30000,
                connectionTimeout: 30000
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        } : null;
    }
}

let poolPromise;

const getConnection = async () => {
    try {
        if (!config) {
            console.warn('Database not configured. Using demo mode.');
            throw new Error('Database not configured');
        }
        if (!poolPromise) {
            poolPromise = new sql.ConnectionPool(config).connect();
        }
        return await poolPromise;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

// Helper function to execute queries with template literals
const executeQuery = async (query, params = {}) => {
    try {
        const pool = await getConnection();
        let formattedQuery = query;
        
        // Replace ${param} with actual values
        for (const [key, value] of Object.entries(params)) {
            const placeholder = `\${${key}}`;
            if (typeof value === 'string') {
                formattedQuery = formattedQuery.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `'${value.replace(/'/g, "''")}'`);
            } else if (value === null || value === undefined) {
                formattedQuery = formattedQuery.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'NULL');
            } else {
                formattedQuery = formattedQuery.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value.toString());
            }
        }
        
        const result = await pool.request().query(formattedQuery);
        return result;
    } catch (error) {
        console.error('Query execution failed:', error);
        throw error;
    }
};

/**
 * Execute a parameterized query using mssql's request.input() — prevents SQL injection.
 * @param {string} query  - SQL with @paramName placeholders
 * @param {Object} params - Plain object: { paramName: value, ... }
 *                          Types are inferred: string→NVarChar, integer→Int, boolean→Bit, null→NVarChar NULL
 */
const executeParameterized = async (query, params = {}) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        for (const [name, value] of Object.entries(params)) {
            if (value === null || value === undefined) {
                request.input(name, sql.NVarChar, null);
            } else if (typeof value === 'boolean') {
                request.input(name, sql.Bit, value ? 1 : 0);
            } else if (typeof value === 'number') {
                if (Number.isInteger(value)) {
                    request.input(name, sql.Int, value);
                } else {
                    request.input(name, sql.Float, value);
                }
            } else {
                // Strings and UUIDs — NVarChar(MAX) covers all lengths safely
                request.input(name, sql.NVarChar(sql.MAX), String(value));
            }
        }
        return await request.query(query);
    } catch (error) {
        console.error('Parameterized query failed:', error);
        throw error;
    }
};

export { sql, getConnection, executeQuery, executeParameterized };