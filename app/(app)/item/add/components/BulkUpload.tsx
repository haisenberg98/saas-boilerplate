'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { toast } from 'react-toastify';

interface ProductData {
    categoryName: string;
    shopName: string;
    name: string;
    price: number;
    description: string;
    specification: string;
}

const BulkUpload = () => {
    const [csvData, setCsvData] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const utils = trpc.useUtils();
    const router = useRouter();

    const addProductsBulk = trpc.addProductsBulk.useMutation({
        onError: (error) => {
            console.error('Bulk upload error:', error);
            setIsUploading(false);
            toast.error('Failed to upload items: ' + error.message);
        },
        onSuccess: async (data) => {
            console.log('Bulk upload success:', data);
            console.log('Number of items created:', data.length);
            setIsUploading(false);
            toast.success(`Successfully uploaded ${data.length} items`);
            setCsvData('');
            
            // Revalidate relevant queries
            await utils.getAllProducts.invalidate();
            await utils.getShopsWithProductCounts.invalidate();
            await utils.getShops.invalidate();
            await utils.getCategories.invalidate();
            await utils.getItemsByCategory.invalidate();
            
            // Revalidate static pages
            try {
                await fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        paths: [
                            '/', // Home page with item list
                            '/item/list', // Admin item list
                            '/category', // Category pages (will revalidate all category routes)
                        ],
                        revalidateAll: true // Revalidate all category pages dynamically
                    })
                });
                console.log('Static pages revalidated');
            } catch (error) {
                console.error('Failed to revalidate static pages:', error);
            }
            
            // Force router refresh to ensure all pages update
            router.refresh();
        }
    });

    const downloadTemplate = () => {
        const template = `Espresso,Kofe,Coffee Maker Pro,129.99,Professional grade coffee maker,Stainless steel construction
Grinders,Kofe,Ceramic Burr Grinder,59.99,Precision grinding,Adjustable grind settings`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'item-upload-template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const parseCSV = (csv: string): ProductData[] => {
        // Parse CSV handling multiline quoted fields (for HTML specifications)
        const parseCSVWithMultiline = (csvText: string): string[][] => {
            const rows: string[][] = [];
            const lines = csvText.split(/\r?\n/);
            let currentRow: string[] = [];
            let currentField = '';
            let inQuotes = false;
            let fieldIndex = 0;

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    const nextChar = line[i + 1];
                    
                    if (char === '"' && !inQuotes) {
                        inQuotes = true;
                    } else if (char === '"' && inQuotes) {
                        if (nextChar === '"') {
                            // Escaped quote
                            currentField += '"';
                            i++; // Skip next quote
                        } else {
                            inQuotes = false;
                        }
                    } else if (char === ',' && !inQuotes) {
                        currentRow.push(currentField.trim());
                        currentField = '';
                        fieldIndex++;
                    } else {
                        currentField += char;
                    }
                }

                // If we're in quotes, add line break and continue to next line
                if (inQuotes) {
                    currentField += '\n';
                } else {
                    // End of row
                    currentRow.push(currentField.trim());
                    if (currentRow.length > 0 && currentRow.some(field => field.length > 0)) {
                        rows.push(currentRow);
                    }
                    currentRow = [];
                    currentField = '';
                    fieldIndex = 0;
                }
            }

            // Handle last field if needed
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                if (currentRow.some(field => field.length > 0)) {
                    rows.push(currentRow);
                }
            }

            return rows;
        };

        const rows = parseCSVWithMultiline(csv);
        
        if (rows.length === 0) return [];

        // Check if first row contains headers
        const firstRow = rows[0];
        const firstRowStr = firstRow.join(',').toLowerCase();
        
        const hasHeaders = 
            firstRowStr.includes('categoryname') || firstRowStr.includes('category') ||
            firstRowStr.includes('shopname') || firstRowStr.includes('provider name') ||
            firstRowStr.includes('productname') || firstRowStr.includes('item name') || firstRowStr.includes('name') ||
            (firstRow.length >= 4 && firstRow[3]?.toLowerCase() === 'price');

        const dataRows = hasHeaders ? rows.slice(1) : rows;

        return dataRows
            .map((row) => {
                return {
                    categoryName: row[0] || '',
                    shopName: row[1] || '',
                    name: row[2] || '',
                    price: parseFloat(row[3]) || 0,
                    description: row[4] || '',
                    specification: row[5] || ''
                };
            })
            .filter((item) => item.name && item.categoryName && item.shopName);
    };

    const handleUpload = async () => {
        setIsUploading(true);
        try {
            console.log('Raw CSV data:', csvData);
            const items = parseCSV(csvData);

            if (items.length === 0) {
                throw new Error('No valid items found in CSV data');
            }

            console.log('Parsed items count:', items.length);
            console.log('Parsed items:', items);
            toast.info(`Found ${items.length} items to upload`);
            
            console.log('Sending to mutation:', items);
            addProductsBulk.mutate(items);
        } catch (error) {
            console.error('Error in handleUpload:', error);
            setIsUploading(false);
            toast.error(error instanceof Error ? error.message : 'Invalid CSV format');
        }
    };

    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <h3 className='mb-4 md:text-2xl'>Bulk Item Upload</h3>

            <Button onClick={downloadTemplate} variant='outline' className='mb-4'>
                Download Template
            </Button>

            <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={`Espresso,Kofe,Portable Machine,89.99,Compact design,Travel friendly`}
                // placeholder={`Paste CSV data with or without headers:\ncategoryName,shopName,name,price,description,specification\nCeramic Burr Grinder,59.99,Precision grinding,Adjustable grind settings\n\nOr just data rows:\nEspresso,Kofe,Portable Machine,89.99,Compact design,Travel friendly`}
                className='mb-4 h-72'
            />

            <Button onClick={handleUpload} disabled={isUploading || !csvData.trim()}>
                {isUploading ? 'Uploading...' : 'Upload Items'}
            </Button>
        </section>
    );
};

export default BulkUpload;
