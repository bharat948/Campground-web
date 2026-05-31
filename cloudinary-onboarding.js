const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dstwudmxl',
    api_key: '424865644349685',
    api_secret: 'AgyuRmJmrvl_gATZf8ztkR_F8Ko',
});

async function main() {
    const sampleImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

    const uploadResult = await cloudinary.uploader.upload(sampleImageUrl);
    console.log('Secure URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);

    const resource = await cloudinary.api.resource(uploadResult.public_id);
    console.log('Width:', resource.width);
    console.log('Height:', resource.height);
    console.log('Format:', resource.format);
    console.log('File size (bytes):', resource.bytes);

    // f_auto — Cloudinary picks the best image format for the browser (e.g. WebP, AVIF)
    // q_auto — Cloudinary applies automatic quality compression to reduce file size
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
        secure: true,
        transformation: [
            { fetch_format: 'auto' },
            { quality: 'auto' },
        ],
    });

    console.log('\nDone! Click link below to see optimized version of the image. Check the size and the format.');
    console.log('Transformed URL:', transformedUrl);
}

main().catch(console.error);
