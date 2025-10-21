import { countSubtotal, slugify } from '@/lib/utils';
import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

//types
type ShippedItemsEmailProps = {
  orderDetails: {
    orderCode: string;
    fullName: string;
    address: string;
    suburb: string;
    city: string;
    postCode: string;
    country: string;
    deliveryInstructions: string;
    shippingMethod: string;
    totalPrice: number;
    trackingCode: string;
    shippingProvider: string;
    shippingProviderWebsite: string;
    shipmentCounts: number;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    orderItems: {
      name: string;
      image: string;
      quantity: number;
      price: number;
    }[];
  };
};

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;

export const ShippedItemsEmail = ({
  orderDetails,
}: ShippedItemsEmailProps) => (
  <Html>
    <Head />
    <Preview>We just shipped your order!</Preview>

    <Body style={main}>
      <Container style={container}>
        <Section>
          <Row>
            <Column>
              <Link href='https://kofe.co.nz' style={productLink}>
                <Img
                  src={`https://storage.googleapis.com/kofe_bucket/uploads/assets/kofe-logo-background.png`}
                  width='60'
                  height='30'
                  alt='Kofe Logo'
                />
              </Link>
            </Column>

            {/* <Column align='right' style={tableCell}>
                <Text style={heading}>Receipt</Text>
              </Column> */}
          </Row>
        </Section>
        <Section>
          <Row>
            <Column align='center' style={ctaTitle}>
              <Text style={ctaText}>Order shipped notification!</Text>
            </Column>
          </Row>
        </Section>
        <Section>
          <Row>
            <Column style={walletWrapper}>
              <span style={walletLinkText}>
                Hello, we just shipped your order.{' '}
                {orderDetails?.shipmentCounts > 1 && (
                  <>
                    Your order includes items from multiple providers, so you may
                    receive separate packages at different times. We&apos;ll
                    provide tracking for each package to help you monitor
                    delivery.
                  </>
                )}{' '}
                Here are the details:
              </span>
            </Column>
          </Row>
        </Section>
        <Section style={informationTable}>
          <Row style={informationTableRow}>
            <Column colSpan={2}>
              <Section>
                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>EMAIL</Text>
                    <Link
                      style={{
                        ...informationTableValue,
                        color: '#42413D',
                        textDecoration: 'underline',
                      }}
                    >
                      {orderDetails?.user?.email}
                    </Link>
                  </Column>
                </Row>

                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>INVOICE DATE</Text>
                    <Text style={informationTableValue}>
                      {orderDetails?.createdAt}
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>ORDER ID</Text>
                    <Link
                      style={{
                        ...informationTableValue,
                        color: '#42413D',
                        textDecoration: 'underline',
                      }}
                      href={
                        baseUrl + '/orders/details/' + orderDetails?.orderCode
                      }
                    >
                      {orderDetails?.orderCode}
                    </Link>
                  </Column>
                </Row>
              </Section>
            </Column>
          </Row>
          <Row>
            <Column style={informationTableColumn}>
              <Text style={informationTableLabel}>SHIPPING</Text>
              <Text style={informationTableValue}>FREE - Tracked</Text>
            </Column>
          </Row>
          <Row>
            <Column style={informationTableColumn} colSpan={2}>
              <Text style={informationTableLabel}>DELIVERY TO</Text>
              <Text style={informationTableValue}>
                {orderDetails?.fullName}
              </Text>
              <Text style={informationTableValue}>{orderDetails?.address}</Text>
              <Text style={informationTableValue}>
                {orderDetails?.suburb}, {orderDetails?.city}{' '}
                {orderDetails?.postCode}
              </Text>
              <Text style={informationTableValue}>{orderDetails?.country}</Text>
              <Text style={informationTableLabel}>INSTRUCTIONS</Text>
              <Text style={informationTableValue}>
                {orderDetails?.deliveryInstructions}
              </Text>
              <Text style={informationTableLabel}>TRACKING CODE</Text>
              <Text style={informationTableValue}>
                {orderDetails?.trackingCode}
              </Text>
              <Text style={informationTableLabel}>SHIPPING PROVIDER</Text>
              <Text style={informationTableValue}>
                {orderDetails?.shippingProvider}
              </Text>
              {orderDetails?.shippingProviderWebsite && (
                <>
                  <Text style={informationTableLabel}>
                    SHIPPING PROVIDER WEBSITE
                  </Text>
                  <Text style={informationTableValue}>
                    {orderDetails?.shippingProviderWebsite}
                  </Text>
                </>
              )}
            </Column>
          </Row>
        </Section>
        <Section style={productTitleTable}>
          <Text style={productsTitle}>Shipped items</Text>
        </Section>
        {orderDetails?.orderItems.map((item: any, index: number) => {
          const topSpace = index === 0 ? '0px' : '30px';

          return (
            <React.Fragment key={index}>
              <Section>
                <Row>
                  <Column style={{ width: '64px', paddingTop: topSpace }}>
                    <Img
                      src={item?.image}
                      width='64'
                      height='44'
                      alt='chemex'
                      style={productIcon}
                    />
                  </Column>
                  <Column style={{ paddingLeft: '22px' }}>
                    <Text style={productTitle}>
                      <Link
                        href={
                          baseUrl +
                          '/item/' +
                          item?.id +
                          '/' +
                          slugify(item?.name)
                        }
                      >
                        <Text style={productTitle}>{item?.name}</Text>
                      </Link>
                    </Text>
                    <Text style={productDescription}>{item?.quantity}x</Text>
                  </Column>

                  <Column style={productPriceWrapper} align='right'>
                    <Text style={productPrice}>
                      ${countSubtotal(item?.quantity, item?.price).toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </React.Fragment>
          );
        })}
        <Hr style={productPriceLine} />
        {/* <Section align='right'>
          <Row>
            <Column style={tableCell} align='right'>
              <Text style={productPriceTotal}>TOTAL</Text>
            </Column>
            <Column style={productPriceVerticalLine}></Column>
            <Column style={productPriceLargeWrapper}>
              <Text style={productPriceLarge}>
                ${orderDetails?.totalPrice.toFixed(2)}
              </Text>
            </Column>
          </Row>
        </Section>
        <Hr style={productPriceLineBottom} /> */}
      </Container>
    </Body>
  </Html>
);

export default ShippedItemsEmail;

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: '#ffffff',
};

const resetText = {
  margin: '0',
  padding: '0',
  lineHeight: 1.4,
};

const container = {
  margin: '0 auto',
  padding: '20px 0px 48px',
  width: '340px',
  maxWidth: '100%',
};

const tableCell = { display: 'table-cell' };

const heading = {
  fontSize: '18px',
  fontWeight: '300',
  color: '#888888',
};

const productLink = {
  fontSize: '12px',
  color: 'rgb(0,112,201)',
  textDecoration: 'none',
};

const informationTable = {
  borderCollapse: 'collapse' as const,
  borderSpacing: '0px',
  color: 'rgb(51,51,51)',
  backgroundColor: 'rgb(250,250,250)',
  borderRadius: '3px',
  fontSize: '12px',
  marginTop: '30px',
};

const informationTableRow = {
  height: '46px',
};

const informationTableColumn = {
  paddingLeft: '20px',
  paddingRight: '20px',
  borderStyle: 'solid',
  borderColor: 'white',
  borderWidth: '0px 1px 1px 0px',
  height: '44px',
  paddingBottom: '10px',
};

const informationTableLabel = {
  ...resetText,
  color: '#42413D',
  fontSize: '10px',
  paddingTop: '10px',
};

const informationTableValue = {
  fontSize: '12px',
  margin: '0',
  lineHeight: 1.4,
};

const productTitleTable = {
  ...informationTable,
  margin: '30px 0 15px 0',
  height: '24px',
};

const productsTitle = {
  background: '#fafafa',
  paddingLeft: '10px',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const productIcon = {
  margin: '0 0 0 20px',
  borderRadius: '14px',
  border: '1px solid rgba(128,128,128,0.2)',
};

const productTitle = {
  fontSize: '12px',
  fontWeight: '600',
  ...resetText,
  marginLeft: '10px',
};

const productDescription = {
  fontSize: '12px',
  color: '#42413D',
  ...resetText,
  marginLeft: '10px',
};

const productPriceTotal = {
  margin: '0',
  color: '#42413D',
  fontSize: '10px',
  fontWeight: '600',
  padding: '0px 30px 0px 0px',
  textAlign: 'right' as const,
};

const productPrice = {
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
};

const productPriceLarge = {
  margin: '0px 20px 0px 0px',
  fontSize: '16px',
  fontWeight: '600',
  whiteSpace: 'nowrap' as const,
  textAlign: 'right' as const,
};

const productPriceWrapper = {
  display: 'table-cell',
  padding: '0px 20px 0px 0px',
  width: '100px',
  verticalAlign: 'top',
};

const productPriceLine = { margin: '30px 0 0 0' };

const productPriceVerticalLine = {
  height: '48px',
  borderLeft: '1px solid',
  borderColor: 'rgb(238,238,238)',
};

const productPriceLargeWrapper = { display: 'table-cell', width: '90px' };

const productPriceLineBottom = { margin: '0 0 30px 0' };

const block = { display: 'block' };

const ctaTitle = {
  display: 'block',
  margin: '0px 0 0 0',
};

const ctaText = { fontSize: '18px', fontWeight: '500', color: '#42413D' };

const walletWrapper = { display: 'table-cell', margin: '0px 0 0 0' };

const walletBottomLine = { margin: '30px 0 20px 0' };

const walletLinkText = {
  fontSize: '12px',
  fontWeight: '400',
  textDecoration: 'none',
  color: '#42413D',
};
