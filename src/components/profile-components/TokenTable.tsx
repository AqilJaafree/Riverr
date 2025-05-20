import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TokenTable() {
    const tokens = [
        {
            name: "USDT",
            balance: "171,423.59",
            price: "$1.01",
            performance: "+0.55%",
            value: "$173,137.82",
        },
        {
            name: "WBTC",
            balance: "5.56",
            price: "$29,196.00",
            performance: "-1.2%",
            value: "$143,989.54",
        },
        {
            name: "WETH",
            balance: "6.54",
            price: "$1,835.04",
            performance: "-1.2%",
            value: "$10,836.58",
        },
    ];

    return (
        <Card className="bg-gray-800">
            <CardHeader>
                <CardTitle>Token Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell>Token</TableCell>
                            <TableCell>Balance</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>7d Performance</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tokens.map((token, index) => (
                            <TableRow key={index}>
                                <TableCell>{token.name}</TableCell>
                                <TableCell>{token.balance}</TableCell>
                                <TableCell>{token.price}</TableCell>
                                <TableCell>{token.performance}</TableCell>
                                <TableCell>{token.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
