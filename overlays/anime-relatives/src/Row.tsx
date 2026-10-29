import { memo, useState, type CSSProperties, type ReactNode } from 'react';
import { assetUrls } from '@racelink/overlay';
import { battleTag, say, type Language } from './phrases';
import { formatGap, formatLap, formatRating, textOn } from './format';
import type { Row as RowData } from './relative';
import type { Settings } from './racelink-settings';

export type ColumnId = Settings['columns'][number]['id'];

/** A picture Racelink serves; it leaves its place empty when Racelink has none. */
function Asset({ src, className }: Readonly<{ src: string; className: string }>) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={className}>
      {failed !== src && (
        <img
          src={src}
          alt=""
          draggable={false}
          onError={() => {
            setFailed(src);
          }}
        />
      )}
    </span>
  );
}

const cell = (row: RowData, column: ColumnId, isRace: boolean): ReactNode => {
  switch (column) {
    case 'position':
      return (
        <span key={column} className="c-position">
          <span>{row.position ?? ''}</span>
        </span>
      );
    case 'classStripe':
      return <span key={column} className="c-classStripe" />;
    case 'number':
      return (
        <span key={column} className="c-number">
          {row.carNumber === '' ? '' : `#${row.carNumber}`}
        </span>
      );
    case 'brand':
      return row.brand === null ? (
        <span key={column} className="c-brand" />
      ) : (
        <Asset key={column} className="c-brand" src={assetUrls.carLogo(row.brand)} />
      );
    case 'flag':
      return row.countryCode === null ? (
        <span key={column} className="c-flag" />
      ) : (
        <Asset key={column} className="c-flag" src={assetUrls.flag(row.countryCode)} />
      );
    case 'name':
      return (
        <span key={column} className="c-name">
          {row.name}
        </span>
      );
    case 'tags':
      return (
        <span key={column} className="c-tags">
          {row.tags.slice(0, 2).map((tag) => (
            <i key={tag.key} title={tag.name} style={{ background: tag.color }} />
          ))}
        </span>
      );
    case 'licence':
      return (
        <span key={column} className="c-licence">
          {row.licence !== null && (
            <span style={{ background: row.licence.color, color: textOn(row.licence.color) }}>
              {row.licence.text}
            </span>
          )}
        </span>
      );
    case 'rating':
      return (
        <span key={column} className="c-rating">
          {formatRating(row.rating)}
        </span>
      );
    case 'ratingChange': {
      const change = row.ratingChange;
      return (
        <span
          key={column}
          className={`c-ratingChange ${change !== null && change < 0 ? 'down' : 'up'}`}
        >
          {change === null || !isRace ? '' : change > 0 ? `+${String(change)}` : String(change)}
        </span>
      );
    }
    case 'pit':
      return (
        <span key={column} className="c-pit">
          {row.inPit ? <span>PIT</span> : row.outLap ? <span className="out">OUT</span> : null}
        </span>
      );
    case 'lastLap':
      return (
        <span key={column} className="c-lastLap">
          {row.carIdx === null ? '' : formatLap(row.lastLap)}
        </span>
      );
    case 'gap':
      return (
        <span key={column} className="c-gap">
          {row.carIdx === null ? '' : row.isReference ? <b>YOU</b> : formatGap(row.gap)}
        </span>
      );
  }
};

type Props = Readonly<{
  row: RowData;
  columns: readonly ColumnId[];
  isRace: boolean;
  battleAura: boolean;
  speedLines: boolean;
  language: Language;
}>;

/** One car of the board. `data-car` lets the effects find it. */
export const Row = memo(function Row({
  row,
  columns,
  isRace,
  battleAura,
  speedLines,
  language,
}: Props) {
  const battle = battleAura && row.battle;
  const classes = [
    'row',
    row.carIdx === null ? 'empty' : '',
    row.isReference ? 'reference' : '',
    row.lapping ? 'lapping' : '',
    row.lapped ? 'lapped' : '',
    row.inPit ? 'inPit' : '',
    battle ? 'battle' : '',
  ];
  return (
    <div
      className={classes.join(' ')}
      data-car={row.carIdx ?? undefined}
      style={{ '--class': row.classColor } as CSSProperties}
    >
      <div className="rowBg">{row.isReference && speedLines && <div className="speedLines" />}</div>
      {battle && <span className="battleTag">{say(battleTag, language, row.key)}</span>}
      {columns.map((column) => cell(row, column, isRace))}
    </div>
  );
});
