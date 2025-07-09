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

  // API anahtarının formatını kontrol et
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken.startsWith('r8_')) {
    console.error("Geçersiz Replicate API anahtarı formatı. Anahtar 'r8_' ile başlamalıdır.");
    return NextResponse.json(
      { error: "Geçersiz API anahtarı formatı. Lütfen Replicate hesabınızdan doğru API anahtarını alın." },
      { status: 400 }
    );
  }

  try {
    const req = await request.json();
    const { image, theme, room } = req;

    // Replicate nesnesi, anahtarı GÜVENLİ BİR ŞEKİLDE .env.local'den alır.
    const replicate = new Replicate({
      auth: apiToken,
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

  } catch (error: any) {
    console.error("Replicate API hatası:", error);
    
    // Daha detaylı hata mesajları
    if (error.message?.includes('Unauthorized') || error.status === 401) {
      return NextResponse.json(
        { error: "API anahtarı geçersiz veya yetkisiz. Lütfen Replicate hesabınızdan yeni bir API anahtarı oluşturun." },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('Not Found') || error.status === 404) {
      return NextResponse.json(
        { error: "Model bulunamadı veya erişim izni yok. Model adını kontrol edin." },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('rate limit') || error.status === 429) {
      return NextResponse.json(
        { error: "API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Yapay zeka modeli çalıştırılırken bir sorun oluştu.",
        details: error.message || "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
}