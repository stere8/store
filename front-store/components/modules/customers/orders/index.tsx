"use client";
import React from "react";
import { Order, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from "axios";
import useSWR, { Fetcher } from "swr";
import Loading from "@/components/custom/Loading";
import { useAuth } from "@clerk/nextjs";
import LeftSidebar from "../LeftSidebar";
import Container from "@/components/custom/Container";

export default function Orders() {
  // fecthing client
  const { getToken } = useAuth();
  const { userId } = useAuth();
  const fetcher: Fetcher<Order[], string> = async (url: string) => {
    const token = await getToken();
    return await axios
      .get(url, {
        params: { user_id: userId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data.data)
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  const { data, isLoading } = useSWR<Order[]>(
    process.env.NEXT_PUBLIC_API_URL + "/api/user/orders",
    fetcher
  );

  return (
    <section className="py-10">
      {isLoading && <Loading loading={true} />}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-8 lg:gap-8">
          <LeftSidebar />
          <div className="col-span-3">
            <DataTable
              className="[&>#search]:hidden"
              searchKey="name"
              columns={columns}
              data={data ? data : []}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
