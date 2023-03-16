import { Page } from "@profits-gg/ui";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { DrawingManager } from "@react-google-maps/api";
import { useContext, useEffect, useMemo, useState } from "react";
import useDebounce from "@profits-gg/lib/hooks/useDebounce";
import { api } from "src/utils/api";
import GoogleDataItem from "src/components/GoogleDataItem";
import type { List } from "@prisma/client";
import { useSession } from "next-auth/react";
import { LoginModalContext } from "src/components/Layout";

export default function GoogleMaps() {
  const { status: sessionStatus } = useSession();

  const { setLoginOpen } = useContext(LoginModalContext);

  const libraries = useMemo(() => ["places", "drawing"], []);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 24.682657,
    lng: 46.690707,
  });

  const { data: lists } = api.list.list.useQuery();

  const debouncedMapCenter = useDebounce(mapCenter, 500);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: true,
    }),
    [],
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
    libraries: libraries as any,
  });

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
    getPlaces(map);
  };

  const getPlaces = (onLoadMap: google.maps.Map) => {
    const placeApi = new google.maps.places.PlacesService(
      onLoadMap || (map as google.maps.Map),
    );

    const request = {
      location: debouncedMapCenter,
      radius: 500,
    };

    placeApi.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results as google.maps.places.PlaceResult[]);
      }
    });
  };

  const { lat, lng } = debouncedMapCenter;

  useEffect(() => {
    if (map) {
      getPlaces(map);
    }
  }, [lat, lng]);

  console.log("places", places);

  return (
    <Page title="🗺️ خرائط قوقل">
      <div className="grid w-full grid-cols-12 gap-4">
        <div className="col-span-12 h-[450px] overflow-hidden rounded-md p-4 md:h-[65vh]">
          {isLoaded ? (
            <GoogleMap
              options={mapOptions}
              zoom={16}
              center={debouncedMapCenter}
              mapContainerStyle={{ width: "100%", height: "100%" }}
              mapTypeId={google.maps.MapTypeId.ROADMAP}
              onCenterChanged={() => {
                if (map) {
                  const center = map
                    .getCenter()
                    ?.toJSON() as google.maps.LatLngLiteral;
                  if (
                    center?.lat !== mapCenter.lat &&
                    center?.lng !== mapCenter.lng
                  ) {
                    setMapCenter(center);
                  }
                }
              }}
              onLoad={onMapLoad}
            >
              <DrawingManager drawingMode={null} />
              <div className="absolute top-0 flex w-full gap-4 overflow-scroll rounded-md p-2 lg:left-2 lg:h-full lg:w-4/12 lg:flex-col">
                {places.map((place) => {
                  if (!place.business_status) return null;

                  return (
                    <GoogleDataItem
                      key={place.place_id}
                      lists={lists as List[]}
                      place={place}
                      selectedPlace={selectedPlace}
                      setSelectedPlace={setSelectedPlace}
                      sessionStatus={sessionStatus}
                      setLoginOpen={setLoginOpen}
                    />
                  );
                })}
              </div>
            </GoogleMap>
          ) : null}
        </div>
      </div>
    </Page>
  );
}
