import { NextResponse } from 'next/server';

export async function GET() {
    const phpApiUrl = process.env.PHP_API_URL || 'https://app.trisonet.com/api';

    try {
        const res = await fetch(`${phpApiUrl}/user/pending_migration/count`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            return NextResponse.json({ pendingCount: 0, weeklyExpected: 0 }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ pendingCount: 0, weeklyExpected: 0 }, { status: 200 });
    }
}
