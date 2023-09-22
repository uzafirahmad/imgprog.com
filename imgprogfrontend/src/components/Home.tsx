import React, { useRef, ChangeEvent, useState, useEffect } from "react";
import "./Home.css";
import axios from "axios";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const Home = () => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
  });
  const [images, setImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const imageRef = useRef<HTMLImageElement | null>(null);

  const fetchImages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/images");
      setImages(res.data); // Update the state with the fetched images
    } catch (err) {
      console.error("An error occurred:", err);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    document.getElementById("floatingimagediv")?.classList.add("active");
    document.getElementById("dimscreen")?.classList.add("active");

    if (selectedFiles) {
      setSelectedImages(selectedFiles);
      setCurrentImageIndex(0); // Start with the first image
      displayImage(selectedFiles[0]);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const displayImage = (file: File) => {
    if (!file) {
      console.error("File is null or undefined.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      if (imageDataUrl) {
        document
          .getElementById("roactcroppedimagesrc")
          ?.setAttribute("src", imageDataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadClick = () => {
    if (imageRef.current && selectedImages) {
      const canvas = document.createElement("canvas");
      const img = imageRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          img,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width * scaleX,
          crop.height * scaleY
        );

        canvas.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append("image", blob, "cropped-image.png");

            // Upload image to server
            try {
              const res = await axios.post(
                "http://localhost:5000/upload",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              console.log(res.data.message); // Image uploaded successfully!
            } catch (err) {
              console.error("An error occurred:", err);
            }

            // const url = URL.createObjectURL(blob);
            // setCroppedImage(url);

            // // Create a temporary link element to trigger the download
            // const a = document.createElement("a");
            // a.href = url;
            // a.download = "cropped-image.png";
            // a.click();

            // // Clean up
            // URL.revokeObjectURL(url);

            // Move to the next image if available
            const nextIndex = currentImageIndex + 1;
            if (nextIndex < selectedImages.length) {
              setCurrentImageIndex(nextIndex);
              displayImage(selectedImages[nextIndex]);
            } else {
              document
                .getElementById("floatingimagediv")
                ?.classList.remove("active");
              document.getElementById("dimscreen")?.classList.remove("active");
              fetchImages();
            }
          }
        }, "image/png");
      }
    }
  };

  return (
    <>
      <div id="dimscreen"></div>
      <div id="floatingimagediv">
        <ReactCrop
          aspect={1}
          className="custom-react-crop"
          crop={crop}
          onChange={(c) => setCrop(c)}
        >
          <img src={""} id="roactcroppedimagesrc" ref={imageRef} />
        </ReactCrop>
        <div id="floatingimagedivbuttonsmaster">
          <button id="floatingimagedivbuttonsave" onClick={handleDownloadClick}>
            Save
          </button>
          <button
            onClick={() => {
              document
                .getElementById("floatingimagediv")
                ?.classList.remove("active");
              document.getElementById("dimscreen")?.classList.remove("active");
              document
                .getElementById("roactcroppedimagesrc")
                ?.setAttribute("src", "");
              //   setSelectedImages(null);
              //   setCurrentImageIndex(0);
              //   setCrop({
              //     unit: "%",
              //     x: 0,
              //     y: 0,
              //     width: 0,
              //     height: 0,
              //   });
            }}
            id="floatingimagedivbuttondel"
          >
            Cancel Upload
          </button>
        </div>
      </div>
      <div
        id="floatingbutton"
        onClick={() => {
          document.getElementById("fileinput")?.click();
        }}
      >
        +
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#1c1e2b",
        }}
      >
        <div id="imgprogtitle">ImgProg.</div>
        <div id="imagecollection">
          {images.map((image, index) => (
            <img
              key={index}
              src={`http://localhost:5000${image}`}
              alt=""
              className="stockimage"
            />
          ))}
        </div>
        <input
          type="file"
          id="fileinput"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </>
  );
};

export default Home;
