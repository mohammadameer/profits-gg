import type { Data, List } from "@prisma/client";
import { Stage } from "@prisma/client";
import { SelectInput } from "@profits-gg/ui";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { api } from "../utils/api";

const DataItem = ({
  lists,
  dataItem,
}: //   stages,
{
  //   stages: Stage[] | undefined;
  lists: List[] | undefined;
  dataItem: Data;
}) => {
  const { control, watch, setValue } = useForm();

  const list = watch("list");
  // const stage = watch("stage");

  const [showData, setShowData] = useState(false);

  const { data: dataItemUnchanged } = api.data.retrieve.useQuery(
    {
      id: dataItem.id,
    },
    {
      enabled: showData,
    },
  );

  const { data: dataLists } = api.data.lists.useQuery({
    dataId: dataItem.id,
  });

  const { mutate: addDataToList } = api.list.addData.useMutation();
  const { mutate: removeDataFromList } = api.list.removeData.useMutation();

  // const { data: dataStage } = api.data.stage.useQuery({
  //   dataId: dataItem.id,
  // });

  // const { mutate: addDataToStage } = api.stage.addData.useMutation();
  // const { mutate: removeDataFromStage } = api.stage.removeData.useMutation();

  const handleUpdateDataLists = async () => {
    let updated = false;

    if (list) {
      for (const listId of list) {
        // add data to list if not exists
        if (!dataLists?.map((list) => list.id).includes(listId)) {
          await addDataToList({
            dataId: dataItem.id,
            listId,
          });
          updated = true;
        }
      }

      for (const listId of dataLists?.map((list) => list.id) || []) {
        // remove data from list if not exists
        if (!list.includes(listId)) {
          await removeDataFromList({
            dataId: dataItem.id,
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

  // const handleUpdateDataStage = async () => {
  //   // add data to stage if not exists
  //   if (!dataStage?.id) {
  //     await addDataToStage({
  //       dataId: dataItem.id,
  //       stageId: stage,
  //     });
  //   } else if (dataStage?.id !== stage) {
  //     // remove data from stage if not exists
  //     await removeDataFromStage({
  //       dataId: dataItem.id,
  //       stageId: dataStage?.id,
  //     });
  //   }
  // };

  // useEffect(() => {
  //   handleUpdateDataStage();
  // }, [stage]);

  // useEffect(() => {
  //   if (dataStage) setValue("stage", dataStage?.id);
  // }, [dataStage]);

  useEffect(() => {
    handleUpdateDataLists();
  }, [list]);

  useEffect(() => {
    if (dataLists)
      setValue(
        "list",
        dataLists?.map((list) => list.id),
      );
  }, [dataLists]);

  const email = dataItemUnchanged?.email || dataItem?.email;
  const phoneNumber = dataItemUnchanged?.phoneNumber || dataItem?.phoneNumber;

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 rounded-md bg-gray-800  p-4 shadow-md md:flex-row ">
      <div className="flex items-center gap-2">
        <p>{dataItem.nameAr || dataItem.name}</p>
        {dataItem?.website ? (
          <a href={dataItem?.website}>🌍</a>
        ) : (
          <p className="opacity-40">🌍</p>
        )}
      </div>

      <div
        className={clsx(
          "flex flex-col items-center gap-2 transition-all md:flex-row ",
          showData && dataItemUnchanged ? "blur-0" : "blur-sm",
          email || phoneNumber ? "opacity-100" : "opacity-40",
        )}
        onClick={() => setShowData(true)}
      >
        <p
          className="cursor-pointer"
          onClick={() => {
            if (showData && dataItemUnchanged) window.open(`mailto:${email}`);
          }}
        >
          📧 {email}
        </p>
        <p
          className="cursor-pointer"
          onClick={() => {
            if (showData && dataItemUnchanged)
              window.open(`tel:${phoneNumber}`);
          }}
        >
          ☎️ {phoneNumber}
        </p>
      </div>
      {/* <div className="w-full md:w-2/12 ">
          <SelectInput
            key={dataItem.id}
            placeholder="المرحلة"
            name="stage"
            control={control}
            options={stages?.map((stage) => ({
              label: stage.name,
              value: stage.id,
            }))}
            noError
          />
        </div> */}
      <div className="w-full md:w-auto md:min-w-[20%]">
        <SelectInput
          key={dataItem.id}
          placeholder="القائمة"
          name="list"
          control={control}
          options={lists?.map((list) => ({
            label: list.name,
            value: list.id,
          }))}
          isMulti={true}
          noError
        />
      </div>
    </div>
  );
};

export default DataItem;
