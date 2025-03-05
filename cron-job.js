import { CronJob } from 'cron';
import { expiredVoucher } from './cron_job/admin-voucher.job';
import { abandonedCart } from './cron_job/app-order.job';
import { cancelledAppointment } from './cron_job/appointment.job';
import { tenantEndTrial } from './cron_job/tenant.job';

// Every night at 2 am.
// '0 0 2 * * *'
// cronTime: '0 06 * * * *',
CronJob.from({
  cronTime: '0 0 */1 * * *',
  onTick: () => {
    tenantEndTrial();
    expiredVoucher();
  },
  start: true,
});

// every hour 0 * * * *
CronJob.from({
  cronTime: '*/1 * * * *',
  onTick: () => {
    cancelledAppointment();
  },
  start: true,
});

// Every 14 days at 2 am.
CronJob.from({
  cronTime: '0 0 2 */14 * *',
  onTick: () => {
    abandonedCart();
  },
  start: true,
});
