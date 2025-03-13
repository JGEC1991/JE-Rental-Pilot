import React from 'react';
    import { useTranslation } from 'react-i18next';

    const Table = ({ data, columns, onView, onEdit, onDelete }) => {
      const { t } = useTranslation('vehicles');

      return (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {t(column.title, { ns: 'vehicles' })}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('actions', { ns: 'vehicles' })}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${column.key}`}
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    >
                      {row[column.key] || '-'}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onView(row)} className="text-blue-500 hover:text-blue-700 mr-2">{t('view', { ns: 'vehicles' })}</button>
                    <button onClick={() => onEdit(row)} className="text-green-500 hover:text-green-700 mr-2">{t('edit', { ns: 'vehicles' })}</button>
                    <button onClick={() => onDelete(row)} className="text-red-500 hover:text-red-700">{t('delete', { ns: 'vehicles' })}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    export default Table;
