// Bu kod dosyası SADECE .env.local dosyasındaki anahtarı okur.
// İçinde asla bir anahtar bulunmaz.

import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: Request) {
  // Bu satır, .env.local dosyasındaki anahtarın var olup olmadığını KONTROL EDER.
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik. Replicate API anahtarı bulunamadı." },
      { status: 500 }
    );
  }

  try {
    const req = await request.json();
    const { image, theme, room } = req;

    // Replicate nesnesi, anahtarı GÜVENLİ BİR ŞEKİLDE .env.local'den alır.
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const model =
      'jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b';

    const input = {
      image,
      prompt: `A ${theme} ${room} Editorial Style Photo, Symmetry, Straight On, Modern Living Room, Large Window, Leather, Glass, Metal, Wood Paneling, Neutral Palette, Ikea, Natural Light, Apartment, Afternoon, Serene, Contemporary, 4k`,
      a_prompt: `best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning`,
    };

    const output = await replicate.run(model, { input });

    return NextResponse.json({ output }, { status: 201 });

  } catch (error) {
    console.error("Replicate API hatası:", error);
    return NextResponse.json(
      { error: "Yapay zeka modeli çalıştırılırken bir sorun oluştu." },
      { status: 500 }
    );
  }
}