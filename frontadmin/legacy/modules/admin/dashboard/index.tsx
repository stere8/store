"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ChartColumn, DollarSign, Package } from "lucide-react";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { TypeStoreModel, TypeSubscriptionModel } from "@/types/models";
import axios from "axios";
import Loading from "@/components/custom/Loading";
import { useAuth } from "@clerk/nextjs";

export default function Dashboard() {
  const [sellers, setSellers] = useState<TypeStoreModel[]>();
  const [members, setMembers] = useState<TypeSubscriptionModel[]>();
  const [earnings, setEarnings] = useState<number>(0);
  const [isLoading, setLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    const getMembers = async () => {
      setLoading(true);
      const token = await getToken();
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/admin/subscriptions", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setMembers(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    const getSellers = async () => {
      const token = await getToken();
      setLoading(true);
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/admin/stores", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setSellers(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    const getEarnings = async () => {
      setLoading(true);
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/admin/payments", {
          params: { type: "subscription" },
        })
        .then((response) => {
          setEarnings(response.data.data[0].totalEarning);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getMembers();
    getSellers();
    getEarnings();
  }, []);

  return (
    <>
      {isLoading && <Loading loading={true} />}
      <div className="flex flex-col gap-8 h-screen">
        <div className="flex flex-col gap-4">
          <Heading
            name="dashboard"
            description="overview of your admin details"
          />
          <Separator />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-thin text-heading">
                Total stores
              </CardTitle>
              <ChartColumn className="w-6 h-6 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sellers ? sellers.length : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-thin text-heading">
                Total Members
              </CardTitle>
              <Package className="w-6 h-6 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {members ? members.length : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-thin text-heading">
                Total Earning
              </CardTitle>
              <DollarSign className="w-6 h-6 text-muted" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                <CurrencyFormat
                  className="font-bold text-3xl"
                  value={earnings / 100}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
