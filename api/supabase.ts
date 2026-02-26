import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const url = new URL(req.url);
    // Extract the Supabase path from the request (e.g., /rest/v1/categories)
    const supabasePath = url.pathname.replace('/api/supabase/', '');
    const targetUrl = `https://zxtwalppkrftzunrmcqm.supabase.co/${supabasePath}${url.search}`;

    // Forward the request to Supabase
    const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dHdhbHBwa3JmdHp1bnJtY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTMwMjYsImV4cCI6MjA4NzY2OTAyNn0.0sjjjbWc-U0RFq2jnBJen_8shNQGEAO1Y4yafSJ4eak',
            'Authorization': req.headers.get('Authorization') || `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dHdhbHBwa3JmdHp1bnJtY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTMwMjYsImV4cCI6MjA4NzY2OTAyNn0.0sjjjbWc-U0RFq2jnBJen_8shNQGEAO1Y4yafSJ4eak`,
            'Content-Type': 'application/json',
            'Prefer': req.headers.get('Prefer') || '',
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    });

    // Return the Supabase response back to the browser
    return new Response(response.body, {
        status: response.status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        },
    });
}
