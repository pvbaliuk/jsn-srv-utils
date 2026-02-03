import {z} from 'zod';
import ms, {type StringValue} from 'ms';

const TIMESTRING_UNIT = ['Years', 'Year', 'Yrs', 'Yr', 'Y', 'Weeks', 'Week', 'W', 'Days', 'Day', 'D', 'Hours', 'Hour', 'Hrs', 'Hr', 'H', 'Minutes', 'Minute', 'Mins', 'Min', 'M', 'Seconds', 'Second', 'Secs', 'Sec', 's', 'Milliseconds', 'Millisecond', 'Msecs', 'Msec', 'Ms'] as const;
const TIMESTRING_REGEX = new RegExp(`\\d+\\s*(?:${TIMESTRING_UNIT.map(unit => unit.toLowerCase()).join('|')})`, 'i');

export const timeStringSchema = z.string()
    .nonempty()
    .regex(TIMESTRING_REGEX)
    .transform(v => ms(v as StringValue));
