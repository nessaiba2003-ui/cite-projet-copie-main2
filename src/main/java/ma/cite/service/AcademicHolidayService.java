package ma.cite.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AcademicHolidayService {

    private record HolidayRange(LocalDate start, LocalDate endExclusive, String title) {}

    private static final List<HolidayRange> HOLIDAYS = List.of(
            new HolidayRange(LocalDate.of(2025, 9, 5), LocalDate.of(2025, 9, 7), "Aid Al Mawlid"),
            new HolidayRange(LocalDate.of(2025, 11, 6), LocalDate.of(2025, 11, 7), "Marche Verte"),
            new HolidayRange(LocalDate.of(2025, 11, 18), LocalDate.of(2025, 11, 19), "Fete de l Independance"),
            new HolidayRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 2), "Nouvel An"),
            new HolidayRange(LocalDate.of(2026, 1, 11), LocalDate.of(2026, 1, 12), "Manifeste de l Independance"),
            new HolidayRange(LocalDate.of(2026, 1, 14), LocalDate.of(2026, 1, 15), "Nouvel An Amazigh"),
            new HolidayRange(LocalDate.of(2026, 1, 25), LocalDate.of(2026, 2, 2), "Vacances de fin du 1er semestre"),
            new HolidayRange(LocalDate.of(2026, 3, 19), LocalDate.of(2026, 3, 23), "Aid Al Fitr"),
            new HolidayRange(LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 11), "Fete du Travail et vacances de printemps"),
            new HolidayRange(LocalDate.of(2026, 5, 26), LocalDate.of(2026, 5, 30), "Aid Al Adha"),
            new HolidayRange(LocalDate.of(2026, 6, 16), LocalDate.of(2026, 6, 17), "Nouvel An Hijri")
    );

    public boolean overlapsHoliday(LocalDateTime debut, LocalDateTime fin) {
        return findHoliday(debut, fin).isPresent();
    }

    public Optional<String> findHoliday(LocalDateTime debut, LocalDateTime fin) {
        if (debut == null || fin == null) {
            return Optional.empty();
        }

        LocalDate start = debut.toLocalDate();
        LocalDate endExclusive = fin.toLocalDate();
        if (!fin.toLocalTime().equals(LocalTime.MIDNIGHT)) {
            endExclusive = endExclusive.plusDays(1);
        }

        for (HolidayRange holiday : HOLIDAYS) {
            if (start.isBefore(holiday.endExclusive()) && holiday.start().isBefore(endExclusive)) {
                return Optional.of(holiday.title());
            }
        }
        return Optional.empty();
    }
}
