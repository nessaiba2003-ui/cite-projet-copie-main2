import { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';
import localService from '@/services/localService';
import {
  findAcademicHolidayInRange,
  getAcademicHolidays,
  isAcademicHoliday,
  toDateKey,
} from '@/utils/academicHolidays';

import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

function normalizeSlot(s) {
  const start = s.dateDebut || s.debut || s.start;
  const end = s.dateFin || s.fin || s.end;
  return { start, end };
}

function fmtHM(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function AvailabilityCalendar({ localId, onSelectSlot, selectedStart, selectedEnd }) {
  const [occupied, setOccupied] = useState([]);
  const [hoverMsg, setHoverMsg] = useState('');
  const lastRangeRef = useRef(null);

  const events = useMemo(() => {
    const holidays = getAcademicHolidays().flatMap((holiday, idx) => {
      const days = [];
      const cursor = new Date(`${holiday.start}T00:00:00`);
      const end = new Date(`${holiday.end}T00:00:00`);

      while (cursor < end) {
        const day = toDateKey(cursor);
        days.push({
          id: `holiday-${idx}-${day}`,
          title: `Ferie - ${holiday.title}`,
          start: `${day}T09:00:00`,
          end: `${day}T19:00:00`,
          backgroundColor: '#DC2626',
          borderColor: '#991B1B',
          textColor: '#FFFFFF',
          editable: false,
          overlap: false,
        });
        cursor.setDate(cursor.getDate() + 1);
      }

      return days;
    });

    const occ = occupied.map((s, idx) => {
      const { start, end } = normalizeSlot(s);
      return {
        id: `occ-${idx}`,
        title: `Réservé ${fmtHM(start)}–${fmtHM(end)}`,
        start,
        end,
        backgroundColor: '#EF4444',
        borderColor: '#B91C1C',
        textColor: '#FFFFFF',
        editable: false,
        overlap: false,
      };
    });

    const sel =
      selectedStart && selectedEnd
        ? [{
            id: 'user-selection',
            title: 'Votre sélection',
            start: selectedStart,
            end: selectedEnd,
            backgroundColor: '#10B981',
            borderColor: '#047857',
            textColor: '#FFFFFF',
            editable: false,
          }]
        : [];

    return [...holidays, ...occ, ...sel];
  }, [occupied, selectedStart, selectedEnd]);

  const fetchRange = async (startStr, endStr) => {
    try {
      const key = `${startStr}_${endStr}`;
      if (lastRangeRef.current === key) return;
      lastRangeRef.current = key;

      const data = await localService.getCalendrier(localId, startStr, endStr);
      setOccupied(Array.isArray(data) ? data : []);
    } catch {
      setOccupied([]);
    }
  };

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    const end = new Date(now);
    end.setDate(now.getDate() + 60);
    fetchRange(start.toISOString(), end.toISOString());
  }, [localId]);

  const isOverlapping = (selStart, selEnd) => {
    if (findAcademicHolidayInRange(selStart, selEnd)) {
      return true;
    }

    for (const slot of occupied) {
      const { start, end } = normalizeSlot(slot);
      const occStart = new Date(start);
      const occEnd = new Date(end);
      if (selStart < occEnd && occStart < selEnd) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-2">
      <style>{`
        .fc-event {
          border-radius: 6px !important;
          padding: 2px 4px !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
        }
        .fc-non-business {
          background: #f5f5f5 !important;
        }
      `}</style>

      {/* LÉGENDE */}
      <div className="rounded-2xl border border-stone-200 bg-white p-3 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded bg-red-500 border-2 border-red-700" />
          <span className="font-semibold text-stone-700">🚫 Réservé (bloqué)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded bg-emerald-500 border-2 border-emerald-700" />
          <span className="font-semibold text-stone-700">✓ Votre sélection</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded bg-white border-2 border-stone-300" />
          <span className="font-semibold text-stone-700">Disponible (cliquez pour réserver)</span>
        </div>
        <div className="ml-auto text-stone-500 font-medium">
          ⏰ Horaires : 9h00 – 19h00
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <p className="text-xs text-stone-600 mb-3">
          💡 <b>Cliquez-glissez</b> sur un créneau libre pour le sélectionner.
          Les créneaux <b className="text-red-600">rouges sont déjà réservés</b> et ne peuvent pas être sélectionnés.
        </p>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="fr"
          firstDay={1}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay',
          }}
          buttonText={{
            today: "Aujourd'hui",
            week: 'Semaine',
            day: 'Jour',
          }}
          /* ===== HORAIRES LIMITÉS : 9h – 19h ===== */
          slotMinTime="09:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          /* ===== AFFICHAGE ===== */
          allDaySlot={false}
          nowIndicator
          height="auto"
          weekends={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '09:00',
            endTime: '19:00',
          }}
          /* ===== SÉLECTION ===== */
          selectable
          selectMirror
          selectOverlap={false}
          selectAllow={(selectInfo) => {
            if (isOverlapping(selectInfo.start, selectInfo.end) || isAcademicHoliday(selectInfo.start)) {
              return false;
            }
            return true;
          }}
          /* ===== ÉVÉNEMENTS ===== */
          events={events}
          eventOverlap={false}
          datesSet={(arg) => fetchRange(arg.startStr, arg.endStr)}
          select={(info) => {
            const holiday = findAcademicHolidayInRange(info.start, info.end);
            if (holiday) {
              toast.error(`Ce jour est ferie : ${holiday.title}`);
              return;
            }
            if (isOverlapping(info.start, info.end)) {
              toast.error('🚫 Ce créneau chevauche une réservation existante');
              return;
            }
            onSelectSlot?.({ start: info.startStr, end: info.endStr });
          }}
          eventMouseEnter={(arg) => {
            if (arg.event.id?.startsWith('occ-') || arg.event.id?.startsWith('holiday-')) {
              setHoverMsg(`🚫 ${arg.event.title}`);
            }
          }}
          eventMouseLeave={() => setHoverMsg('')}
          eventClick={(arg) => {
            // SEULEMENT pour les créneaux occupés (occ-*)
            // NE PAS bloquer le clic sur la sélection de l'utilisateur (user-selection)
            if (arg.event.id?.startsWith('holiday-')) {
              toast.error('Ce jour est ferie - reservation impossible.');
            } else if (arg.event.id?.startsWith('occ-')) {
              toast.error('🚫 Ce créneau est déjà réservé — vous ne pouvez pas le sélectionner.');
            }
          }}
        />
      </div>

      {hoverMsg && (
        <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {hoverMsg}
        </p>
      )}
    </div>
  );
}
