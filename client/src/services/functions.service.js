class OxhuntFunctions {

    getDateString(settings) {
        const start = new Date(settings.startDate);
        const end = new Date(settings.endDate);
        let dateString = start.getMonth() === end.getMonth() ? 
            `${start.toLocaleDateString('en', { month: 'long' })} ${start.getDate()} - ${end.getDate()}` : 
            `${start.toLocaleDateString('en', { month: 'long' })} ${start.getDate()} - ${end.toLocaleDateString('en', { month: 'long' })} ${end.getDate()}`;
        const timezoneOffset = start.getTimezoneOffset();
        dateString += `, ${this.getTimeString(settings.startTime, timezoneOffset)} to ${this.getTimeString(settings.endTime, timezoneOffset)}`;
        return dateString;
    }

    getTimeString(timeString, timezoneOffset) {
        let tokens = timeString.split(':')
        let minutes = (Number(tokens[0]) * 60) + Number(tokens[1]);
        minutes += (timezoneOffset * -1);
        if (0 > minutes) {
            minutes = 1440 + minutes;
        } else if (1440 <= minutes) {
            minutes = minutes - 1440;
        }
        return `${Math.trunc(minutes / 60)}:${((minutes % 60) + '00').substring(0, 2)}`;
    }

}

const oxhuntFunctions = new OxhuntFunctions();

export default oxhuntFunctions;