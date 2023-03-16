import type { Data, List } from "@prisma/client";
import { SelectInput } from "@profits-gg/ui";
import { Marker } from "@react-google-maps/api";
import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { api } from "src/utils/api";

const locationIcon = {
  path: "M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z",
  fillColor: "#1f2937",
  fillOpacity: 1,
  strokeColor: "white",
  strokeWeight: 1,
  scale: 0.08,
};

const GoogleDataItem = ({
  place,
  selectedPlace,
  setSelectedPlace,
  lists,
  sessionStatus,
  setLoginOpen,
}: {
  place: google.maps.places.PlaceResult;
  selectedPlace: google.maps.places.PlaceResult | null;
  setSelectedPlace: (place: google.maps.places.PlaceResult | null) => void;
  lists: List[];
  sessionStatus: "authenticated" | "unauthenticated" | "loading";
  setLoginOpen: Dispatch<SetStateAction<boolean>> | null;
}) => {
  const { control, watch, setValue } = useForm();

  const list = watch("list");

  const {
    data: placeData,
    isLoading: isLoadnigPlaceData,
    status: placeDataStatus,
  } = api.data.retrieve.useQuery({
    dataId: place.place_id,
  });

  const { data: dataLists } = api.data.lists.useQuery(
    {
      dataId: placeData?.id,
    },
    {
      enabled: !!placeData,
    },
  );

  const { mutate: createData } = api.data.create.useMutation();
  const { mutate: addDataToList } = api.list.addData.useMutation();
  const { mutate: removeDataFromList } = api.list.removeData.useMutation();

  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const handleAddDataToList = async (data: Data) => {
    let updated = false;

    if (list) {
      for (const listId of list) {
        // add data to list if not exists
        if (!dataLists?.map((list) => list.id).includes(listId)) {
          await addDataToList({
            dataId: data?.id as string,
            listId,
          });
          updated = true;
        }
      }

      for (const listId of dataLists?.map((list) => list.id) || []) {
        // remove data from list if not exists
        if (!list.includes(listId)) {
          await removeDataFromList({
            dataId: data?.id as string,
            listId,
          });
          updated = true;
        }
      }

      if (updated)
        toast("تم تحديث القوائم بنجاح", {
          icon: "👍",
        });
    }
  };

  const handleAddData = async () => {
    if (!placeData && !isLoadnigPlaceData && placeDataStatus === "success") {
      await createData(
        {
          name: place.name || "",
          dataId: place.place_id as string,
          type: "googlePlace",
          googleTypes: place.types,
        },
        {
          onSuccess: (data) => {
            handleAddDataToList(data);
          },
        },
      );
      return;
    }

    if (placeData) {
      handleAddDataToList(placeData);
    }
  };

  useEffect(() => {
    handleAddData();
  }, [list]);

  useEffect(() => {
    if (dataLists) {
      setValue(
        "list",
        dataLists?.map((list) => list.id),
      );

      marker?.setIcon(
        Object.assign({}, locationIcon, {
          fillColor: dataLists?.length ? "#e5e7eb" : "#1f2937",
        }),
      );
    }
  }, [dataLists]);

  useEffect(() => {
    marker?.setIcon(
      Object.assign({}, locationIcon, {
        fillColor:
          selectedPlace?.place_id == place?.place_id || dataLists?.length
            ? "#e5e7eb"
            : "#1f2937",
      }),
    );
  }, [selectedPlace]);

  return (
    <>
      <Marker
        onLoad={(marker) => {
          marker.setIcon({
            path: "M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z",
            fillColor: dataLists?.length ? "#e5e7eb" : "#1f2937",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 1,
            scale: 0.08,
          });

          setMarker(marker);
        }}
        onClick={() => {
          setSelectedPlace(place);
        }}
        position={
          place.geometry?.location?.toJSON() as google.maps.LatLngLiteral
        }
      />
      <div
        key={place.place_id}
        className={clsx(
          "flex min-w-[40vh] cursor-pointer flex-col gap-4 rounded-md border-4 bg-gray-800 p-4 shadow-md transition-all duration-200  lg:min-w-full",
          selectedPlace?.place_id == place.place_id
            ? "border-gray-700"
            : "border-gray-800",
        )}
        onClick={() => {
          if (selectedPlace?.place_id !== place.place_id) {
            setSelectedPlace(place);
          } else {
            setSelectedPlace(null);
          }
        }}
      >
        <div>{place.name}</div>
        <div className="w-full md:w-auto md:min-w-[20%]">
          <SelectInput
            key={place.place_id}
            placeholder="القائمة"
            name="list"
            control={control}
            options={lists?.map((list: List) => ({
              label: list.name,
              value: list.id,
            }))}
            isMulti={true}
            noError
            onMenuOpen={() => {
              if (sessionStatus == "unauthenticated") {
                setLoginOpen?.(true);
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default GoogleDataItem;
