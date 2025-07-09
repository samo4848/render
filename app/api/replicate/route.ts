// app/api/replicate/route.ts DOSYASINA BUNU YAPIŞTIRIN

import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: Request) {
  // API anahtarının olup olmadığını kontrol et
  if (!process.env.REPLICATE_API_TOKEN=AIzaSyDGOyAJ3LaXDcEd9sRUDpCY7KiJP3XF98s) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik. Replicate API anahtarı bulunamadı." },
      { status: 500 }
    );
  }

  try {
    // 1. İstemciden gelen veriyi al
    const req = await request.json();
    const { image, theme, room } = req;

    // 2. Replicate nesnesini .env.local'deki anahtarla başlat
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // 3. Yapay zeka modelini belirle
    const model =
      'jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b';

    // 4. Modelin girdilerini hazırla
    const input = {
      image,
      prompt: `A ${theme} ${room} Editorial Style Photo, Symmetry, Straight On, Modern Living Room, Large Window, Leather, Glass, Metal, Wood Paneling, Neutral Palette, Ikea, Natural Light, Apartment, Afternoon, Serene, Contemporary, 4k`,
      a_prompt: `best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning`,
    };

    // 5. Modeli çalıştır
    const output = await replicate.run(model, { input });

    // 6. Sonucu istemciye gönder
    return NextResponse.json({ output }, { status: 201 });

  } catch (error) {
    // 7. Bir hata olursa yakala ve istemciye bildir
    console.error("Replicate API hatası:", error);
    return NextResponse.json(
      { error: "Yapay zeka modeli çalıştırılırken bir sorun oluştu." },
      { status: 500 }
    );
  }
}