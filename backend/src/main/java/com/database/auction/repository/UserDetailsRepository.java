package com.database.auction.repository;

import com.database.auction.entity.UserDetails;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDetailsRepository extends JpaRepository<UserDetails, String> {
    UserDetails findByUsername(String username);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query(value = """
      INSERT INTO user_details
        (username, first_name, last_name, address, phone_number)
      VALUES
        (:username, :firstName, :lastName, :address, :phoneNumber)
      """, nativeQuery = true)
    int insertDetails(
            @Param("username")    String username,
            @Param("firstName")   String firstName,
            @Param("lastName")    String lastName,
            @Param("address")     String address,
            @Param("phoneNumber") String phoneNumber
    );

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query(value = """
      UPDATE user_details
      SET
        first_name   = :firstName,
        last_name    = :lastName,
        address      = :address,
        phone_number = :phoneNumber
      WHERE
        username = :username
      """, nativeQuery = true)
    int updateDetails(
            @Param("username")    String username,
            @Param("firstName")   String firstName,
            @Param("lastName")    String lastName,
            @Param("address")     String address,
            @Param("phoneNumber") String phoneNumber
    );
}
