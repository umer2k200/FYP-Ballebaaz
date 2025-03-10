const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Storage} = require("@google-cloud/storage");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();
const storage = new Storage();
const bucket = storage.bucket("ballebaaz-74803.appspot.com");

exports.mergeMatchHighlights = functions
    .runWith({memory: "2GB", timeoutSeconds: 300})
    .https.onRequest(async (req, res) => {
      try {
        console.log("Fetching match highlight videos...");

        // List all video files from `matchHighlights/` folder in Firebase
        const [files] = await bucket.getFiles({prefix: "temp_highlights/"});
        const videoFiles = files.filter((file) => file.name.endsWith(".mp4"));

        if (videoFiles.length === 0) {
          return res.status(400).send("No match highlight videos found.");
        }

        console.log(`Found ${videoFiles.length} videos. Downloading...`);

        // Download all videos to a temp directory
        const tempDir = os.tmpdir();
        const videoPaths = [];

        for (const file of videoFiles) {
          const tempFilePath = path.join(tempDir, path.basename(file.name));
          await file.download({destination: tempFilePath});
          videoPaths.push(tempFilePath);
          console.log(`Downloaded: ${file.name}`);
        }

        // Define output merged video path
        const mergedVideoPath = path.join(tempDir, "merged_highlight.mp4");

        console.log("Merging videos using FFmpeg...");
        await new Promise((resolve, reject) => {
          const ffmpegCommand = ffmpeg();

          videoPaths.forEach((video) => {
            ffmpegCommand.input(video);
          });

          ffmpegCommand
              .on("end", resolve)
              .on("error", reject)
              .mergeToFile(mergedVideoPath, tempDir);
        });

        console.log("Video merging completed. Uploading merged video...");

        // Upload merged video to Firebase Storage
        const mergedFileName = `temp_highlights/${Date.now()}_merged.mp4`;
        const mergedFile = bucket.file(mergedFileName);

        await mergedFile.save(fs.readFileSync(mergedVideoPath), {
          contentType: "video/mp4",
        });

        // Get the download URL
        const [url] = await mergedFile.getSignedUrl({
          action: "read",
          expires: "03-01-2030",
        });

        console.log(`Merged video uploaded: ${url}`);

        // Clean up temp files
        videoPaths.forEach((file) => fs.unlinkSync(file));
        fs.unlinkSync(mergedVideoPath);

        res.status(200).json({message: "Merge successful", downloadUrl: url});
      } catch (error) {
        console.error("Error merging videos:", error);
        res.status(500).send("Failed to merge videos");
      }
    });
