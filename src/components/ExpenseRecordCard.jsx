import React from 'react';
import { useTranslation } from 'react-i18next';

function ExpenseRecordCard({ expense }) {
  const { t } = useTranslation('expenses');

  return (
    <div>
      <h2>{t('expenseDetails', { ns: 'expenses' })}</h2>
      <p>{t('date', { ns: 'expenses' })}: {expense?.date}</p>
      <p>{t('amount', { ns: 'expenses' })}: {expense?.amount}</p>
      <p>{t('description', { ns: 'expenses' })}: {expense?.description}</p>
      <p>{t('status', { ns: 'expenses' })}: {expense?.status}</p>
      <p>{t('activityType', { ns: 'expenses' })}: {expense?.activity_type}</p>
      <p>{t('driver', { ns: 'expenses' })}: {expense?.driver_name}</p>
      <p>{t('vehicle', { ns: 'expenses' })}: {expense?.vehicle_name}</p>
      {expense?.attachment_file && (
        <p>
          {t('proofOfPayment', { ns: 'expenses' })}:
          <a href={expense.attachment_file} target="_blank" rel="noopener noreferrer">
            {t('viewProof', { ns: 'expenses' })}
          </a>
        </p>
      )}
    </div>
  );
}

export default ExpenseRecordCard;
