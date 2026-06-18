import { NextResponse } from 'next/server';
import net from 'net';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { ipAddress, port = 9100 } = body;

    if (!ipAddress) {
      return NextResponse.json({ error: 'เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธ IP เน€เธเธฃเธทเนเธญเธเธเธดเธกเธเน' }, { status: 400 });
    }

    return new Promise<NextResponse>((resolve) => {
      const client = new net.Socket();
      client.setTimeout(5000); 

      // เนเธเนเธ•เธเธธเนเธเน€เธเธทเนเธญเธกเธ•เนเธญเนเธเธ—เธตเน IP เน€เธเธฃเธทเนเธญเธเธเธดเธกเธเน
      client.connect(Number(port), ipAddress, () => {
        // เธเธณเธชเธฑเนเธ ESC/POS เน€เธเธทเนเธญเธเธ•เนเธ: เธฅเนเธฒเธเน€เธเธฃเธทเนเธญเธ -> เธเธดเธกเธเนเธเนเธญเธเธงเธฒเธก -> เธ•เธฑเธ”เธเธฃเธฐเธ”เธฒเธฉ
        const initCmd = Buffer.from([0x1B, 0x40]);
        const textCmd = Buffer.from(`\n--- FoodScan POS ---\nTest Print from Notebook OK!\nIP: ${ipAddress}\n\n\n\n\n`);
        const cutCmd = Buffer.from([0x1D, 0x56, 0x00]);

        const payload = Buffer.concat([initCmd, textCmd, cutCmd]);

        client.write(payload, () => {
          client.destroy(); 
          resolve(NextResponse.json({ success: true, message: 'เธเธดเธกเธเนเธชเธณเน€เธฃเนเธ' }));
        });
      });

      client.on('error', (err) => {
        client.destroy();
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      });

      client.on('timeout', () => {
        client.destroy();
        resolve(NextResponse.json({ error: 'Timeout' }, { status: 504 }));
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
