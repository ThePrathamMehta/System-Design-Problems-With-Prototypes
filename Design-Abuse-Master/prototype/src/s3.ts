import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const loadAbusedWords = async (bucket: string) => {
  try {
    const command = new GetObjectCommand({
        Bucket : bucket,
        Key : "abused_words.csv"
    })
    const response = await client.send(command);
    const text = await response.Body?.transformToString();
    const words = text?.split("\n").map((line) => line.split(",")[0]).filter((word,index,self) => self.indexOf(word) === index)
    return words;
  } catch (error) {
    console.log(error);
  }
};
