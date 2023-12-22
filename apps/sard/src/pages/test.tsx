import { Button } from "@profits-gg/ui";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/utils/api";
import Compressor from "compressorjs";

export default function Test() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>();
  const [compressedImages, setCompressedImages] = useState<string[]>();
  const [smallCompressedImages, setSmallCompressedImages] = useState<string[]>();

  const { isLoading: isGettingImage, mutateAsync: getImage } = api.openai.getImage.useMutation();

  function dataURLtoFile(dataurl: string, filename: string) {
    let arr = dataurl.split(",") as any[],
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  return null;

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-6">
      <div className="flex gap-2">
        <Button
          text="Test"
          onClick={async () => {
            setLoading(true);
            setImages([]);
            setCompressedImages([]);

            ["1024x1024", "512x512", "256x256"]?.map(async (size) => {
              const image = await getImage({
                prompt:
                  "detailed, cartoonic, colorful and oil paster painting of a friendly bear and a curious rabbit exploring a forest together",
                size: size as any,
              });

              setImages((prev) => [...(prev ?? []), image]);
            });

            setLoading(false);
          }}
          className="!bg-white !text-black"
        />
        <Button
          text="Compress"
          onClick={async () => {
            setLoading(true);
            setCompressedImages([]);

            images?.map(async (image) => {
              // image is base64 encoded
              // convert to blob
              const url = "data:image/png;base64," + image;
              const imageFile = dataURLtoFile(url, `${Date.now()}.png`);

              const compressedImage = await new Promise<string>((resolve) => {
                new Compressor(imageFile, {
                  strict: true,
                  checkOrientation: true,
                  maxWidth: 0,
                  maxHeight: 0,
                  minWidth: 0,
                  minHeight: 0,
                  width: 256,
                  height: 256,
                  resize: "cover",
                  quality: 0.4,
                  mimeType: "auto",
                  convertTypes: ["image/png"],
                  convertSize: 0,
                  success: (result) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(result);
                    reader.onloadend = () => {
                      const base64data = reader.result;
                      resolve(base64data as string);
                    };
                  },
                });
              });

              setCompressedImages((prev) => [
                ...(prev ?? []),
                compressedImage?.replace("data:image/jpeg;base64,", ""),
              ]);

              setLoading(false);
            });
          }}
          className="!bg-white !text-black"
        />
        <Button
          text="Compress Small Images"
          onClick={async () => {
            setLoading(true);
            setSmallCompressedImages([]);

            compressedImages?.map(async (image) => {
              // image is base64 encoded
              // convert to blob
              const url = "data:image/png;base64," + image;
              const imageFile = dataURLtoFile(url, `${Date.now()}.png`);

              const compressedImage = await new Promise<string>((resolve) => {
                new Compressor(imageFile, {
                  strict: true,
                  checkOrientation: true,
                  maxWidth: 0,
                  maxHeight: 0,
                  minWidth: 0,
                  minHeight: 0,
                  width: 128,
                  height: 128,
                  resize: "cover",
                  quality: 0.2,
                  mimeType: "auto",
                  convertTypes: ["image/png"],
                  convertSize: 0,
                  success: (result) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(result);
                    reader.onloadend = () => {
                      const base64data = reader.result;
                      resolve(base64data as string);
                    };
                  },
                });
              });

              setSmallCompressedImages((prev) => [
                ...(prev ?? []),
                compressedImage?.replace("data:image/jpeg;base64,", ""),
              ]);

              setLoading(false);
            });
          }}
          className="!bg-white !text-black"
        />
      </div>
      {images ? (
        <div className="flex gap-4">
          {images?.map((image) => {
            const img = "data:image/png;base64," + image;
            const buffer = Buffer.from(img.substring(img.indexOf(",") + 1));
            const mb = buffer.length / 1e6;
            return (
              <div className="flex flex-col gap-2">
                <p>{mb} MB</p>
                <div className="relative h-96 w-96">
                  <Image
                    src={"data:image/png;base64," + image}
                    alt="test"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-md"
                    unoptimized={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {compressedImages ? (
        <div className="flex gap-4">
          {compressedImages?.map((image) => {
            const img = "data:image/png;base64," + image;
            const buffer = Buffer.from(img.substring(img.indexOf(",") + 1));
            const mb = buffer.length / 1e6;
            return (
              <div className="flex flex-col gap-2">
                <p>{mb} MB</p>
                <div className="relative h-96 w-96">
                  <Image
                    src={"data:image/png;base64," + image}
                    alt="test"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-md"
                    unoptimized={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {smallCompressedImages ? (
        <div className="flex gap-4">
          {smallCompressedImages?.map((image) => {
            const img = "data:image/png;base64," + image;
            const buffer = Buffer.from(img.substring(img.indexOf(",") + 1));
            const mb = buffer.length / 1e6;
            return (
              <div className="flex flex-col gap-2">
                <p>{mb} MB</p>
                <div className="black relative h-52 w-52">
                  <Image
                    src={"data:image/png;base64," + image}
                    alt="test"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-md"
                    unoptimized={true}
                  />

                  <div className="absolute bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-black/50 via-black/50 p-2">
                    <p className="text text-2xl font-bold leading-10 text-white md:text-2xl">
                      قصة التعاون بين مايا والغابة
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
