package ma.cite.repository;

import ma.cite.model.Reservation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

       // Legacy (si tu gardes encore des comptes demandeurs)
       List<Reservation> findByDemandeurIdOrderByDateDemandeDesc(Long demandeurId);

       @Query("SELECT r FROM Reservation r " +
               "WHERE r.local.id = :localId " +
               "AND r.statut IN ('EN_ATTENTE', 'VALIDEE') " +
               "AND r.dateDebut < :fin AND r.dateFin > :debut")
       List<Reservation> findConflicts(@Param("localId") Long localId,
                                       @Param("debut") LocalDateTime debut,
                                       @Param("fin") LocalDateTime fin);

       @Query("SELECT r FROM Reservation r " +
               "WHERE r.local.id = :localId " +
               "AND r.statut IN ('EN_ATTENTE', 'VALIDEE') " +
               "AND r.dateFin > :debut AND r.dateDebut < :fin " +
               "ORDER BY r.dateDebut")
       List<Reservation> findOccupiedSlots(@Param("localId") Long localId,
                                           @Param("debut") LocalDateTime debut,
                                           @Param("fin") LocalDateTime fin);

       @Query("SELECT COUNT(r) FROM Reservation r " +
               "WHERE r.dateDebut >= :debut AND r.dateFin <= :fin")
       long countByPeriode(@Param("debut") LocalDateTime debut,
                           @Param("fin") LocalDateTime fin);

       @Query("SELECT l.id, l.nom, l.code, COUNT(r) " +
               "FROM Reservation r JOIN r.local l " +
               "WHERE r.dateDebut >= :debut AND r.dateFin <= :fin " +
               "AND r.statut IN ('EN_ATTENTE', 'VALIDEE') " +
               "GROUP BY l.id, l.nom, l.code " +
               "ORDER BY COUNT(r) DESC")
       List<Object[]> findOccupationByLocalWithNames(@Param("debut") LocalDateTime debut,
                                                     @Param("fin") LocalDateTime fin);

       // ReservationRepository.java (AJOUT)
       @Query("""
    SELECT l.id, l.code, l.nom, FUNCTION('date_trunc','month', r.dateDebut), COUNT(r)
    FROM Reservation r JOIN r.local l
    WHERE r.dateDebut >= :debut AND r.dateFin <= :fin
      AND r.statut IN ('EN_ATTENTE','VALIDEE')
    GROUP BY l.id, l.code, l.nom, FUNCTION('date_trunc','month', r.dateDebut)
    ORDER BY FUNCTION('date_trunc','month', r.dateDebut) ASC, COUNT(r) DESC
""")
       List<Object[]> findLocalReservationsByMonth(@Param("debut") LocalDateTime debut,
                                                   @Param("fin") LocalDateTime fin);

       /**
        * Stats par organisme :
        * -> on utilise r.demandeurOrganisme (stocké dans Reservation),
        *    donc pas besoin de JOIN sur Utilisateur.
        */
       @Query("SELECT " +
               "CASE WHEN r.demandeurOrganisme IS NULL OR r.demandeurOrganisme = '' " +
               "     THEN 'Non renseigné' ELSE r.demandeurOrganisme END, " +
               "COUNT(r), " +
               "COUNT(DISTINCT r.demandeurEmail) " +
               "FROM Reservation r " +
               "WHERE r.dateDebut >= :debut AND r.dateFin <= :fin " +
               "AND r.statut IN ('EN_ATTENTE', 'VALIDEE') " +
               "GROUP BY CASE WHEN r.demandeurOrganisme IS NULL OR r.demandeurOrganisme = '' " +
               "              THEN 'Non renseigné' ELSE r.demandeurOrganisme END " +
               "ORDER BY COUNT(r) DESC")
       List<Object[]> findParticipationOrganismesReservations(@Param("debut") LocalDateTime debut,
                                                              @Param("fin") LocalDateTime fin);



       // ReservationRepository.java (AJOUT)
       @Query("""
    SELECT l.id, l.code, l.nom, r.dateDebut
    FROM Reservation r JOIN r.local l
    WHERE r.dateDebut >= :debut AND r.dateFin <= :fin
      AND r.statut IN ('EN_ATTENTE','VALIDEE')
""")
       List<Object[]> findLocalReservationStarts(@Param("debut") LocalDateTime debut,
                                                 @Param("fin") LocalDateTime fin);




       // ReservationRepository.java (AJOUT)
       @Query("""
    SELECT 
      CASE WHEN r.demandeurOrganisme IS NULL OR TRIM(r.demandeurOrganisme) = '' 
           THEN 'Non renseigné' ELSE TRIM(r.demandeurOrganisme) END,
      r.dateDebut
    FROM Reservation r
    WHERE r.dateDebut >= :debut AND r.dateFin <= :fin
      AND r.statut IN ('EN_ATTENTE','VALIDEE')
""")
       List<Object[]> findOrganismeReservationStarts(@Param("debut") LocalDateTime debut,
                                                     @Param("fin") LocalDateTime fin);



       /**
        * Demandeurs actifs = nb d'emails distincts (public + legacy).
        */
       @Query("SELECT COUNT(DISTINCT r.demandeurEmail) " +
               "FROM Reservation r " +
               "WHERE r.dateDebut >= :debut AND r.dateFin <= :fin " +
               "AND r.statut IN ('EN_ATTENTE', 'VALIDEE')")
       long countDemandeursActifs(@Param("debut") LocalDateTime debut,
                                  @Param("fin") LocalDateTime fin);


       @Query("""
select r.typeEvenement, count(r)
from Reservation r
where r.dateDebut >= :debut and r.dateFin <= :fin
  and r.statut in ('EN_ATTENTE','VALIDEE','CONFIRMEE','TERMINEE')
group by r.typeEvenement
order by count(r) desc
""")
       List<Object[]> countReservationsByTypeEvenement(@Param("debut") LocalDateTime debut,
                                                       @Param("fin") LocalDateTime fin);


       @EntityGraph(attributePaths = {"local", "equipementsReserves"})
       @Query("""
select distinct r from Reservation r
where r.dateDebut >= :debut and r.dateFin <= :fin
order by r.dateDemande desc
""")
       List<Reservation> findForReport(@Param("debut") LocalDateTime debut,
                                       @Param("fin") LocalDateTime fin);
}


