'use server';

/**
 * @fileOverview Server Action لإدارة رفع الصور إلى ImgBB.
 * يضمن بقاء مفتاح الـ API سرياً في جانب الخادم.
 */

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;
  
  if (!file) {
    throw new Error('لم يتم توفير ملف.');
  }

  // التحقق من نوع الملف
  if (!file.type.startsWith('image/')) {
    throw new Error('نوع الملف غير صالح. يرجى رفع صورة.');
  }

  // التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت.');
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const apiKey = 'de6cbea8bcb6a5a9ab9d2e0ed1b1e7fe';
    
    const imgbbFormData = new URLSearchParams();
    imgbbFormData.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'فشل الرفع إلى ImgBB');
    }

    return {
      imageUrl: data.data.url,
      imageId: data.data.id,
      deleteUrl: data.data.delete_url,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'حدث خطأ أثناء رفع الصورة.');
  }
}
