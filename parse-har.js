const fs = require('fs');

// Читаем HAR файл
const harData = JSON.parse(fs.readFileSync('dispace.nstu.ru.har', 'utf8'));

// Перебираем все запросы
harData.log.entries.forEach((entry, index) => {
    const url = entry.request.url;
    
    // Ищем запросы к API событий
    if (url.includes('/api/v1/lms/events')) {
        console.log('\n=== API Events Request ===');
        console.log('URL:', url);
        console.log('\nResponse:');
        
        const responseText = entry.response.content.text;
        if (responseText) {
            try {
                const responseData = JSON.parse(responseText);
                console.log(JSON.stringify(responseData, null, 2));
            } catch (e) {
                console.log('First 2000 chars:', responseText.substring(0, 2000));
            }
        }
    }
});
