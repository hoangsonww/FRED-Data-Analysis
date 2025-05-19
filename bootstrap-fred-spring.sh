#!/usr/bin/env bash
# bootstrap-fred-spring.sh
# ------------------------
# Scaffolds a full Spring Boot backend for the FRED Data Analysis Project.
#
# Usage:
#   chmod +x bootstrap-fred-spring.sh
#   ./bootstrap-fred-spring.sh
set -e

# 0. Settings
BASE="$(pwd)"
SPRING_DIR="$BASE/spring"
PKG="com/github/hoangsonww/fred"

# 1. Clean & directories
rm -rf "$SPRING_DIR"
mkdir -p "$SPRING_DIR/src/main/java/$PKG/model"
mkdir -p "$SPRING_DIR/src/main/java/$PKG/repository"
mkdir -p "$SPRING_DIR/src/main/java/$PKG/service"
mkdir -p "$SPRING_DIR/src/main/java/$PKG/controller"
mkdir -p "$SPRING_DIR/src/main/resources"

# 2. pom.xml
cat > "$SPRING_DIR/pom.xml" <<'EOF'
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.github.hoangsonww</groupId>
  <artifactId>fred-data-backend</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>17</java.version>
    <spring.boot.version>2.7.12</spring.boot.version>
  </properties>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-dependencies</artifactId>
        <version>${spring.boot.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <!-- Web -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- MongoDB -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
    <!-- JWT -->
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt</artifactId>
      <version>0.9.1</version>
    </dependency>
    <!-- Lombok -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <scope>provided</scope>
    </dependency>
    <!-- Testing -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <version>2.7.12</version>
      </plugin>
    </plugins>
  </build>
</project>
EOF

# 3. application.properties
cat > "$SPRING_DIR/src/main/resources/application.properties" <<'EOF'
server.port=8080

spring.data.mongodb.uri=mongodb://localhost:27017/fred_data

# FRED API
fred.api.key=${FRED_API_KEY}

# Pinecone
pinecone.api.key=${PINECONE_API_KEY}
pinecone.index.name=${PINECONE_INDEX_NAME}

# JWT
jwt.secret=ChangeMeJWTSecret
EOF

# 4. Main application
cat > "$SPRING_DIR/src/main/java/$PKG/FredDataApplication.java" <<EOF
package com.github.hoangsonww.fred;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FredDataApplication {
    public static void main(String[] args) {
        SpringApplication.run(FredDataApplication.class, args);
    }
}
EOF

# 5. Model: FredSeries
cat > "$SPRING_DIR/src/main/java/$PKG/model/FredSeries.java" <<EOF
package com.github.hoangsonww.fred.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection="fred_series")
public class FredSeries {
    @Id
    private String id;
    private String seriesId;
    private List<Double> values;
    private Date fetchedAt;
}
EOF

# 6. Model: VectorEntry
cat > "$SPRING_DIR/src/main/java/$PKG/model/VectorEntry.java" <<EOF
package com.github.hoangsonww.fred.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection="vector_entries")
public class VectorEntry {
    @Id
    private String id;
    private String seriesId;
    private List<Double> vector;
    private Date upsertedAt;
}
EOF

# 7. Model: ChatMessage
cat > "$SPRING_DIR/src/main/java/$PKG/model/ChatMessage.java" <<EOF
package com.github.hoangsonww.fred.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection="chat_messages")
public class ChatMessage {
    @Id
    private String id;
    private String sessionId;
    private String userInput;
    private String botResponse;
    private Date timestamp;
}
EOF

# 8. Model: AnalysisReport
cat > "$SPRING_DIR/src/main/java/$PKG/model/AnalysisReport.java" <<EOF
package com.github.hoangsonww.fred.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection="analysis_reports")
public class AnalysisReport {
    @Id
    private String id;
    private String seriesId;
    private String reportType;
    private String reportContent;
    private Date createdAt;
}
EOF

# 9. Repository interfaces
cat > "$SPRING_DIR/src/main/java/$PKG/repository/FredSeriesRepository.java" <<EOF
package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.FredSeries;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface FredSeriesRepository extends MongoRepository<FredSeries, String> {}
EOF

cat > "$SPRING_DIR/src/main/java/$PKG/repository/VectorEntryRepository.java" <<EOF
package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.VectorEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface VectorEntryRepository extends MongoRepository<VectorEntry, String> {}
EOF

cat > "$SPRING_DIR/src/main/java/$PKG/repository/ChatMessageRepository.java" <<EOF
package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {}
EOF

cat > "$SPRING_DIR/src/main/java/$PKG/repository/AnalysisReportRepository.java" <<EOF
package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.AnalysisReport;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface AnalysisReportRepository extends MongoRepository<AnalysisReport, String> {}
EOF

# 10. Service: FredService
cat > "$SPRING_DIR/src/main/java/$PKG/service/FredService.java" <<EOF
package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.FredSeries;
import com.github.hoangsonww.fred.repository.FredSeriesRepository;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class FredService {
    private final FredSeriesRepository repo;
    public FredService(FredSeriesRepository repo) { this.repo = repo; }

    public FredSeries fetchSeries(String seriesId) {
        // TODO: call FRED API, parse data
        FredSeries s = FredSeries.builder()
            .seriesId(seriesId)
            .values(List.of())
            .fetchedAt(new Date())
            .build();
        return repo.save(s);
    }
    public List<FredSeries> all() { return repo.findAll(); }
}
EOF

# 11. Service: VectorService
cat > "$SPRING_DIR/src/main/java/$PKG/service/VectorService.java" <<EOF
package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.VectorEntry;
import com.github.hoangsonww.fred.repository.VectorEntryRepository;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class VectorService {
    private final VectorEntryRepository repo;
    public VectorService(VectorEntryRepository repo) { this.repo = repo; }

    public VectorEntry upsert(String seriesId, List<Double> vector) {
        VectorEntry e = VectorEntry.builder()
            .seriesId(seriesId)
            .vector(vector)
            .upsertedAt(new Date())
            .build();
        return repo.save(e);
    }
    public List<VectorEntry> all() { return repo.findAll(); }
}
EOF

# 12. Service: ChatService
cat > "$SPRING_DIR/src/main/java/$PKG/service/ChatService.java" <<EOF
package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.ChatMessage;
import com.github.hoangsonww.fred.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
public class ChatService {
    private final ChatMessageRepository repo;
    public ChatService(ChatMessageRepository repo) { this.repo = repo; }

    public ChatMessage chat(String sessionId, String userInput) {
        // TODO: call vector DB + AI
        String bot = "This is a placeholder response.";
        ChatMessage m = ChatMessage.builder()
            .sessionId(sessionId)
            .userInput(userInput)
            .botResponse(bot)
            .timestamp(new Date())
            .build();
        return repo.save(m);
    }
}
EOF

# 13. Service: AnalysisService
cat > "$SPRING_DIR/src/main/java/$PKG/service/AnalysisService.java" <<EOF
package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.AnalysisReport;
import com.github.hoangsonww.fred.repository.AnalysisReportRepository;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
public class AnalysisService {
    private final AnalysisReportRepository repo;
    public AnalysisService(AnalysisReportRepository repo) { this.repo = repo; }

    public AnalysisReport analyze(String seriesId, String type) {
        // TODO: perform regression, create plots
        String content = "Analysis for " + seriesId + " (" + type + ")";
        AnalysisReport r = AnalysisReport.builder()
            .seriesId(seriesId)
            .reportType(type)
            .reportContent(content)
            .createdAt(new Date())
            .build();
        return repo.save(r);
    }
}
EOF

# 14. Controller: FredController
cat > "$SPRING_DIR/src/main/java/$PKG/controller/FredController.java" <<EOF
package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.FredSeries;
import com.github.hoangsonww.fred.service.FredService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fred")
public class FredController {
    private final FredService service;
    public FredController(FredService service) { this.service = service; }

    @GetMapping("/all")
    public List<FredSeries> all() { return service.all(); }

    @PostMapping("/fetch/{seriesId}")
    public FredSeries fetch(@PathVariable String seriesId) {
        return service.fetchSeries(seriesId);
    }
}
EOF

# 15. Controller: VectorController
cat > "$SPRING_DIR/src/main/java/$PKG/controller/VectorController.java" <<EOF
package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.VectorEntry;
import com.github.hoangsonww.fred.service.VectorService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vector")
public class VectorController {
    private final VectorService service;
    public VectorController(VectorService service) { this.service = service; }

    @GetMapping("/all")
    public List<VectorEntry> all() { return service.all(); }

    @PostMapping("/upsert")
    public VectorEntry upsert(@RequestParam String seriesId,
                              @RequestBody List<Double> vector) {
        return service.upsert(seriesId, vector);
    }
}
EOF

# 16. Controller: ChatController
cat > "$SPRING_DIR/src/main/java/$PKG/controller/ChatController.java" <<EOF
package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.ChatMessage;
import com.github.hoangsonww.fred.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService service;
    public ChatController(ChatService service) { this.service = service; }

    @PostMapping
    public ChatMessage chat(@RequestParam String sessionId,
                            @RequestBody String userInput) {
        return service.chat(sessionId, userInput);
    }
}
EOF

# 17. Controller: AnalysisController
cat > "$SPRING_DIR/src/main/java/$PKG/controller/AnalysisController.java" <<EOF
package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.AnalysisReport;
import com.github.hoangsonww.fred.service.AnalysisService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {
    private final AnalysisService service;
    public AnalysisController(AnalysisService service) { this.service = service; }

    @PostMapping("/{seriesId}/{type}")
    public AnalysisReport analyze(@PathVariable String seriesId,
                                  @PathVariable String type) {
        return service.analyze(seriesId, type);
    }
}
EOF

echo "✔ FRED Spring backend generated under ./spring"
echo "→ cd spring && mvn clean package && java -jar target/fred-data-backend-1.0.0.jar"
