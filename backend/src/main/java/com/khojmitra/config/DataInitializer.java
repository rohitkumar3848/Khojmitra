package com.khojmitra.config;

import com.khojmitra.model.*;
import com.khojmitra.repository.*;
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
    private final ClaimRepository claimRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RewardRepository rewardRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking KhojMitra MongoDB Atlas collections...");

        User admin = userRepository.findByEmail("admin@khojmitra.com").orElse(null);
        User finder = userRepository.findByEmail("rohit@company.com").orElse(null);
        User claimant = userRepository.findByEmail("priya@company.com").orElse(null);

        // 1. Seed Users if not present
        if (admin == null) {
            admin = User.builder()
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
            admin = userRepository.save(admin);
        }

        if (finder == null) {
            finder = User.builder()
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
        }

        if (claimant == null) {
            claimant = User.builder()
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
        }

        // 2. Seed Items if empty
        if (itemRepository.count() == 0) {
            log.info("Seeding initial lost & found items...");

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
                    .rewardNote("₹500 gratitude reward to anyone who returns this key safely!")
                    .userId(claimant.getId())
                    .posterName(claimant.getName())
                    .posterEmail(claimant.getEmail())
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build();
            itemRepository.save(lostKey);
        }

        // 3. Seed Claims, Messages, and Rewards if empty
        if (claimRepository.count() == 0 && finder != null && claimant != null) {
            log.info("Seeding historic claim, chat messages, and rewards into MongoDB...");

            Item returnedWatch = Item.builder()
                    .title("Apple Watch Series 8 (Midnight)")
                    .description("Found on gym treadmill in Tower A Basement 1. Handed over to verified owner.")
                    .category("Electronics")
                    .type(ItemType.FOUND)
                    .location(Location.builder()
                            .city("Gurugram")
                            .locality("Cyber Hub")
                            .officeBuilding("Tower A")
                            .floor("Basement 1")
                            .roomOrDesk("Fitness Center Treadmill 3")
                            .build())
                    .imageUrl("https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80")
                    .date(LocalDate.now().minusDays(5))
                    .status(ItemStatus.RETURNED)
                    .centralDropLocation("Tower A Reception Locker 5")
                    .userId(finder.getId())
                    .posterName(finder.getName())
                    .posterEmail(finder.getEmail())
                    .claimedByUserId(claimant.getId())
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .build();
            returnedWatch = itemRepository.save(returnedWatch);

            Claim sampleClaim = Claim.builder()
                    .itemId(returnedWatch.getId())
                    .itemTitle(returnedWatch.getTitle())
                    .itemImageUrl(returnedWatch.getImageUrl())
                    .claimantId(claimant.getId())
                    .claimantName(claimant.getName())
                    .claimantEmail(claimant.getEmail())
                    .finderId(finder.getId())
                    .finderName(finder.getName())
                    .finderEmail(finder.getEmail())
                    .score(5)
                    .totalQuestions(5)
                    .status(ClaimStatus.DELIVERED)
                    .finderNotes("Verified Apple Watch serial number against Apple Wallet invoice.")
                    .centralDeskNotes("Owner verified at Tower A Reception Desk. Handover successful.")
                    .createdAt(LocalDateTime.now().minusDays(4))
                    .build();
            sampleClaim = claimRepository.save(sampleClaim);

            returnedWatch.setActiveClaimId(sampleClaim.getId());
            itemRepository.save(returnedWatch);

            // Seed chat messages
            ChatMessage msg1 = ChatMessage.builder()
                    .claimId(sampleClaim.getId())
                    .senderId("SYSTEM")
                    .senderName("KhojMitra Bot")
                    .receiverId(finder.getId())
                    .content("🎉 Ownership Quiz Passed! Claimant answered 5/5 questions correctly. Chat is now unlocked.")
                    .isSystemMessage(true)
                    .timestamp(LocalDateTime.now().minusDays(4))
                    .build();
            chatMessageRepository.save(msg1);

            ChatMessage msg2 = ChatMessage.builder()
                    .claimId(sampleClaim.getId())
                    .senderId(claimant.getId())
                    .senderName(claimant.getName())
                    .receiverId(finder.getId())
                    .content("Hi Rohit, thank you so much for finding my Apple Watch!")
                    .isSystemMessage(false)
                    .timestamp(LocalDateTime.now().minusDays(4).plusMinutes(2))
                    .build();
            chatMessageRepository.save(msg2);

            ChatMessage msg3 = ChatMessage.builder()
                    .claimId(sampleClaim.getId())
                    .senderId(finder.getId())
                    .senderName(finder.getName())
                    .receiverId(claimant.getId())
                    .content("Most welcome Priya! I have safely placed it at Tower A Reception Desk, Locker 5.")
                    .isSystemMessage(false)
                    .timestamp(LocalDateTime.now().minusDays(4).plusMinutes(5))
                    .build();
            chatMessageRepository.save(msg3);

            ChatMessage msg4 = ChatMessage.builder()
                    .claimId(sampleClaim.getId())
                    .senderId("SYSTEM")
                    .senderName("KhojMitra Bot")
                    .receiverId(claimant.getId())
                    .content("✅ Finder confirmed ownership! Item is ready for pickup at Tower A Reception Desk. Operating hours: 9 AM - 6 PM.")
                    .isSystemMessage(true)
                    .timestamp(LocalDateTime.now().minusDays(4).plusMinutes(6))
                    .build();
            chatMessageRepository.save(msg4);

            // Seed reward
            Reward sampleReward = Reward.builder()
                    .claimId(sampleClaim.getId())
                    .itemId(returnedWatch.getId())
                    .claimantId(claimant.getId())
                    .claimantName(claimant.getName())
                    .finderId(finder.getId())
                    .finderName(finder.getName())
                    .totalTip(200.0)
                    .finderAmount(100.0)
                    .platformAmount(100.0)
                    .isGoodwillBonus(false)
                    .bonusPoints(0)
                    .createdAt(LocalDateTime.now().minusDays(4).plusHours(1))
                    .build();
            rewardRepository.save(sampleReward);
        }

        log.info("MongoDB Atlas initialization complete. All collections seeded!");
    }
}
