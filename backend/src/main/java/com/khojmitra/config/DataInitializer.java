package com.khojmitra.config;

import com.khojmitra.model.*;
import com.khojmitra.repository.ItemRepository;
import com.khojmitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial users and demo items into MongoDB...");

            // 1. Seed Admin
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@khojmitra.com")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER))
                    .department("Facility & Security")
                    .officeLocation("Headquarters - Tower A")
                    .phone("+91 98765 43210")
                    .karmaPoints(100)
                    .walletBalance(500.0)
                    .build();
            userRepository.save(admin);

            // 2. Seed Employee 1 (Finder)
            User finder = User.builder()
                    .name("Rohit Sharma")
                    .email("rohit@company.com")
                    .password(passwordEncoder.encode("user123"))
                    .roles(Set.of(Role.ROLE_USER))
                    .department("Software Engineering")
                    .officeLocation("Tower B - Floor 4")
                    .phone("+91 98111 22233")
                    .karmaPoints(35)
                    .walletBalance(150.0)
                    .build();
            finder = userRepository.save(finder);

            // 3. Seed Employee 2 (Claimant)
            User claimant = User.builder()
                    .name("Priya Verma")
                    .email("priya@company.com")
                    .password(passwordEncoder.encode("user123"))
                    .roles(Set.of(Role.ROLE_USER))
                    .department("Product Design")
                    .officeLocation("Tower B - Floor 2")
                    .phone("+91 98222 33344")
                    .karmaPoints(20)
                    .walletBalance(300.0)
                    .build();
            claimant = userRepository.save(claimant);

            // 4. Seed Found Item with 5 Verification Questions (APPROVED)
            Item foundEarbuds = Item.builder()
                    .title("Noise Buds VS102 Wireless Earbuds")
                    .description("Found a black charging case with wireless earbuds left on table 7 in the 4th floor cafeteria.")
                    .category("Electronics")
                    .type(ItemType.FOUND)
                    .location(Location.builder()
                            .city("Gurugram")
                            .locality("Cyber Hub")
                            .officeBuilding("Tower B")
                            .floor("4th Floor")
                            .roomOrDesk("Cafeteria Table 7")
                            .build())
                    .imageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80")
                    .date(LocalDate.now().minusDays(1))
                    .status(ItemStatus.APPROVED)
                    .centralDropLocation("Tower B Ground Floor Reception Desk (Locker #14)")
                    .userId(finder.getId())
                    .posterName(finder.getName())
                    .posterEmail(finder.getEmail())
                    .verificationQuestions(List.of(
                            VerificationQuestion.builder().id(1).question("What color is the silicone case cover?").expectedAnswer("Dark Green").build(),
                            VerificationQuestion.builder().id(2).question("Is there any sticker on the case?").expectedAnswer("Batman logo sticker").build(),
                            VerificationQuestion.builder().id(3).question("What is the battery indicator level when opening the lid?").expectedAnswer("2 bars").build(),
                            VerificationQuestion.builder().id(4).question("Which side earbud has a small hairline scratch?").expectedAnswer("Left").build(),
                            VerificationQuestion.builder().id(5).question("What initials or name is engraved on the charging port side?").expectedAnswer("PV").build()
                    ))
                    .createdAt(LocalDateTime.now().minusHours(5))
                    .build();
            itemRepository.save(foundEarbuds);

            // 5. Seed Found Item PENDING_APPROVAL (for Admin testing)
            Item pendingFoundWallet = Item.builder()
                    .title("Tommy Hilfiger Brown Leather Wallet")
                    .description("Brown leather wallet found near ATM kiosk in Tower A ground floor corridor.")
                    .category("Wallets & Bags")
                    .type(ItemType.FOUND)
                    .location(Location.builder()
                            .city("Gurugram")
                            .locality("Cyber Hub")
                            .officeBuilding("Tower A")
                            .floor("Ground Floor")
                            .roomOrDesk("Near Kiosk ATM")
                            .build())
                    .imageUrl("https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80")
                    .date(LocalDate.now())
                    .status(ItemStatus.PENDING_APPROVAL)
                    .centralDropLocation("Tower A Security Desk")
                    .userId(finder.getId())
                    .posterName(finder.getName())
                    .posterEmail(finder.getEmail())
                    .verificationQuestions(List.of(
                            VerificationQuestion.builder().id(1).question("What bank card is in the front slot?").expectedAnswer("HDFC Millennia").build(),
                            VerificationQuestion.builder().id(2).question("Is there a metro card inside? If yes, which color?").expectedAnswer("Yes, Delhi Metro blue").build(),
                            VerificationQuestion.builder().id(3).question("What is the approximate cash amount inside?").expectedAnswer("Around 500").build(),
                            VerificationQuestion.builder().id(4).question("Is there any picture in the transparent card holder?").expectedAnswer("Family photo").build(),
                            VerificationQuestion.builder().id(5).question("What color is the inner stitching?").expectedAnswer("Tan orange").build()
                    ))
                    .createdAt(LocalDateTime.now().minusMinutes(40))
                    .build();
            itemRepository.save(pendingFoundWallet);

            // 6. Seed Lost Item (Lost Car Key)
            Item lostKey = Item.builder()
                    .title("Hyundai Creta Smart Key with Lanyard")
                    .description("Lost my car key somewhere between Basement 2 parking slot B-42 and Tower B elevator lobby.")
                    .category("Keys")
                    .type(ItemType.LOST)
                    .location(Location.builder()
                            .city("Gurugram")
                            .locality("Cyber Hub")
                            .officeBuilding("Tower B")
                            .floor("Basement 2")
                            .roomOrDesk("Parking Slot B-42")
                            .build())
                    .imageUrl("https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&auto=format&fit=crop&q=80")
                    .date(LocalDate.now().minusDays(2))
                    .status(ItemStatus.APPROVED)
                    .userId(claimant.getId())
                    .posterName(claimant.getName())
                    .posterEmail(claimant.getEmail())
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build();
            itemRepository.save(lostKey);

            log.info("Demo data initialized successfully!");
        }
    }
}
