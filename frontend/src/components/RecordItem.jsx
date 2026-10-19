import { Soup, CupSoda, Cookie, Carrot, Store, Package, Receipt, X } from 'lucide-react';
import { useI18n } from '../i18n.jsx';
import { money, timeKL } from '../util.js';

const ICONS = { nasi_lemak: Soup, drinks: CupSoda, kuih: Cookie, raw_materials: Carrot, stall_rental: Store, packaging: Package };

export default function RecordItem({ rec, onDelete }) {
  const { t, catName } = useI18n();
  const isSale = rec.type === 'sales';
  const name = catName(rec);
  const title = isSale ? `${t('saleOf')} ${name.toLowerCase()}` : name; // "Jualan minuman" / "Pembungkusan"
  const Icon = ICONS[rec.systemKey] || Receipt;
  return (
    <div className="item">
      <div className={'ico ' + (isSale ? 'g' : 'e')}><Icon size={20} /></div>
      <div className="grow">
        <b>{title}</b>
        <small>{timeKL(rec.date)} · {rec.paymentMethod === 'cash' ? t('cash') : t('qr')}</small>
      </div>
      <div className={'amt ' + (isSale ? 'pos' : 'neg')}>{isSale ? '+' : '−'}{money(rec.amount)}</div>
      {onDelete && <button className="x" onClick={() => onDelete(rec)} aria-label={t('delete')}><X size={16} /></button>}
    </div>
  );
}
