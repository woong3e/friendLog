package xyz.wondang.friendlog.image;

import java.net.URI;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

/**
 * S3 구현.
 *
 * Presigned URL: 서버가 자기 키로 "이 파일을 이 형식으로 5분 안에 올려도 된다"고 서명한 URL.
 * 브라우저는 AWS 키 없이 이 URL로 S3에 직접 업로드한다 → 이미지가 서버를 거치지 않아 서버 부담이 없다.
 * 서명은 서버 안에서 계산만 하므로, URL을 만들 때 S3에 요청이 가지 않는다.
 */
@Component
public class S3ImageStorage implements ImageStorage {

    private final StorageProperties properties;
    private final S3Presigner presigner;
    private final S3Client client;

    public S3ImageStorage(StorageProperties properties) {
        this.properties = properties;
        Region region = Region.of(properties.region());
        AwsCredentialsProvider credentials = properties.hasStaticCredentials()
                ? StaticCredentialsProvider.create(AwsBasicCredentials.create(properties.accessKey(), properties.secretKey()))
                : DefaultCredentialsProvider.builder().build();
        // 로컬 가짜 S3는 http://localhost:9090/{버킷}/{키} 모양(path-style)만 지원한다
        S3Configuration s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(properties.hasEndpoint())
                .build();

        S3Presigner.Builder presignerBuilder = S3Presigner.builder()
                .region(region).credentialsProvider(credentials).serviceConfiguration(s3Config);
        var clientBuilder = S3Client.builder()
                .region(region).credentialsProvider(credentials).serviceConfiguration(s3Config);
        if (properties.hasEndpoint()) {
            presignerBuilder.endpointOverride(URI.create(properties.endpoint()));
            clientBuilder.endpointOverride(URI.create(properties.endpoint()));
        }
        this.presigner = presignerBuilder.build();
        this.client = clientBuilder.build();
    }

    @Override
    public String presignUpload(String key, String contentType) {
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(properties.bucket())
                .key(key)
                .contentType(contentType)
                .build();
        PutObjectPresignRequest presign = PutObjectPresignRequest.builder()
                .signatureDuration(properties.presignTtl())
                .putObjectRequest(put)
                .build();
        return presigner.presignPutObject(presign).url().toString();
    }

    @Override
    public void delete(String key) {
        client.deleteObject(DeleteObjectRequest.builder().bucket(properties.bucket()).key(key).build());
    }
}
