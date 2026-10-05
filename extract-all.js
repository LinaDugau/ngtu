const fs = require('fs');

const harData = JSON.parse(fs.readFileSync('dispace.nstu.ru.har', 'utf8'));

const allScheduleData = {};

harData.log.entries.forEach(entry => {
    const url = entry.request.url;
    
    if (url.includes('/api/v1/lms/events')) {
        const responseText = entry.response.content.text;
        if (responseText) {
            try {
                const data = JSON.parse(responseText);
                
                // Получаем месяц и год из URL
                const urlObj = new URL(url);
                const month = urlObj.searchParams.get('month');
                const year = urlObj.searchParams.get('year');
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                
                console.log(`\n=== ${monthKey} ===`);
                
                // Фильтруем только дни текущего месяца (числа от 1 до 31)
                const monthData = {};
                for (let day = 1; day <= 31; day++) {
                    const dayStr = day.toString();
                    if (data[dayStr] && data[dayStr].length > 0) {
                        monthData[dayStr] = data[dayStr].map(event => ({
                            title: event.title,
                            description: event.description,
                            start_time: event.start_time,
                            end_time: event.end_time,
                            type: event.type,
                            teacher: event.created_by ? 
                                `${event.created_by.last_name} ${event.created_by.first_name} ${event.created_by.patronymic}` : 
                                null
                        }));
                        console.log(`  Day ${day}: ${monthData[dayStr].map(e => e.title).join(', ')}`);
                    }
                }
                
                if (Object.keys(monthData).length > 0) {
                    allScheduleData[monthKey] = monthData;
                }
            } catch (e) {
                console.error('Parse error');
            }
        }
    }
});

// Выводим итоговый объект
console.log('\n\n=== FULL DATA ===');
console.log(JSON.stringify(allScheduleData, null, 2));
